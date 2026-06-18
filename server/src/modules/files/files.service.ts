import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import PDFDocument from 'pdfkit';
import mammoth from 'mammoth';
import {
  convertDocumentExact,
  decodeUploadFilename,
  exportDocxFileToPdf,
  exportDocxToHtmlBundle,
  importHtmlFileToDocx,
  isLibreOfficeAvailable,
} from './libreoffice.helper';
import {
  buildLibreOfficeHtml,
  injectEditorChrome,
  parseLibreOfficeHtml,
  rewriteEditorAssetUrls,
  sanitizeEditorHtml,
  sanitizeLibreOfficeHtmlForBrowser,
  stripEditorArtifacts,
  type EditorBundleMeta,
} from './html-editor.helper';
import { findUnicodeFont } from './unicode-font.helper';
import {
  convertPdfToDocxWithPdf2Docx,
  isPdf2DocxAvailable,
} from './pdf2docx.helper';
import {
  cleanPdfExtractedText,
  cleanHtmlExtracted,
  hasPdfGarbage,
} from './text-cleanup.helper';
import {
  extractPlainTextFromDocx,
  normalizeEditorText,
  patchDocxPreservingFormat,
  plainTextFromEditorHtml,
  saveOriginalDocxToBundle,
} from './docx-patch.helper';

export type ConvertMode = 'exact' | 'rich' | 'text';

export type TextExtractionResult = {
  text: string;
  hasGarbage: boolean;
  method: 'libreoffice' | 'pdf-parse' | 'mammoth' | 'plain';
};

@Injectable()
export class FilesService {
  constructor(private prisma: PrismaService) {}

  private getUploadDir() {
    return process.env.UPLOAD_DIR || './uploads';
  }

  private isConvertibleName(name: string, mimetype?: string) {
    const ext = path.extname(name).toLowerCase();
    return (
      ['.pdf', '.docx', '.doc', '.txt'].includes(ext) ||
      mimetype === 'application/pdf' ||
      mimetype?.includes('word') ||
      mimetype === 'text/plain'
    );
  }

  async getConverterCapabilities() {
    const lo = isLibreOfficeAvailable();
    const p2d = await isPdf2DocxAvailable();
    return {
      libreOfficeInstalled: lo,
      pdf2docxAvailable: p2d,
      exactFormatAvailable: lo,
      unicodeFontAvailable: !!findUnicodeFont(),
      modes: [
        {
          id: 'exact',
          label: 'Exact format',
          description: 'Full layout, fonts, tables, emoji (LibreOffice + font embed)',
          available: lo,
        },
        {
          id: 'rich',
          label: 'Rich text',
          description: 'Bold, lists, tables + Unicode/emoji (HTML engine)',
          available: true,
        },
        {
          id: 'text',
          label: 'Plain text',
          description: 'Simple text only — no formatting',
          available: true,
        },
      ],
      installHint: lo
        ? null
        : 'Install LibreOffice for best results: brew install --cask libreoffice',
    };
  }

  validateConvertibleUpload(file: Express.Multer.File) {
    if (!this.isConvertibleName(file.originalname, file.mimetype)) {
      throw new BadRequestException(
        'Only PDF, DOC, DOCX, and TXT files can be uploaded for conversion',
      );
    }
  }

  async saveUploadedFile(userId: string, file: Express.Multer.File) {
    const uploadDir = this.getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const originalName = decodeUploadFilename(file.originalname);
    const safeFilename = originalName.replace(/[^\w.\- ()[\]@#&+,=!']/g, '_');
    const filename = `${Date.now()}-${safeFilename}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    const saved = await this.prisma.file.create({
      data: {
        userId,
        originalName,
        filename,
        mimetype: file.mimetype,
        size: file.size,
        path: filePath,
        url: `/uploads/${filename}`,
      },
    });
    return saved;
  }

  async uploadAndConvert(
    userId: string,
    file: Express.Multer.File,
    targetFormat: 'pdf' | 'docx',
    mode: ConvertMode = 'exact',
  ) {
    this.validateConvertibleUpload(file);
    const source = await this.saveUploadedFile(userId, file);
    const converted = await this.convertFile(userId, source.id, targetFormat, mode);
    return { source, converted };
  }

  async findUserFiles(userId: string) {
    return this.prisma.file.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findUserFile(userId: string, fileId: string) {
    const file = await this.prisma.file.findFirst({
      where: { id: fileId, userId },
    });
    if (!file) throw new NotFoundException('File not found');
    if (!fs.existsSync(file.path)) {
      throw new NotFoundException('File missing on disk');
    }
    return file;
  }

  async getFileDownload(userId: string, fileId: string) {
    const file = await this.findUserFile(userId, fileId);
    return {
      stream: fs.createReadStream(file.path),
      filename: file.originalName,
      mimetype: file.mimetype || 'application/octet-stream',
      size: file.size,
    };
  }

  async extractText(userId: string, fileId: string): Promise<TextExtractionResult> {
    const file = await this.findUserFile(userId, fileId);
    const buffer = fs.readFileSync(file.path);
    const ext = path.extname(file.originalName).toLowerCase();

    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      return this.extractPdfText(file.path, buffer);
    }

    if (['.docx', '.doc'].includes(ext) || file.mimetype.includes('word')) {
      const result = await mammoth.extractRawText({ buffer });
      const text = result.value?.trim() || '';
      return { text, hasGarbage: false, method: 'mammoth' };
    }

    if (ext === '.txt' || file.mimetype === 'text/plain') {
      return { text: buffer.toString('utf-8'), hasGarbage: false, method: 'plain' };
    }

    throw new BadRequestException(
      'Text extraction supports PDF, DOC, DOCX, and TXT files only',
    );
  }

  async extractHtml(userId: string, fileId: string): Promise<string> {
    const file = await this.findUserFile(userId, fileId);
    const buffer = fs.readFileSync(file.path);
    const ext = path.extname(file.originalName).toLowerCase();

    if (['.docx', '.doc'].includes(ext) || file.mimetype.includes('word')) {
      const result = await mammoth.convertToHtml({ buffer });
      return cleanHtmlExtracted(result.value || '');
    }

    if (ext === '.pdf' || file.mimetype === 'application/pdf') {
      const loHtml = await this.extractPdfHtmlViaLibreOffice(file.path);
      if (loHtml) return cleanHtmlExtracted(loHtml);

      const { text } = await this.extractPdfText(file.path, buffer);
      return text
        .split(/\n/)
        .map((line) => `<p>${line.replace(/</g, '&lt;') || '&nbsp;'}</p>`)
        .join('');
    }

    const { text } = await this.extractText(userId, fileId);
    return `<pre>${text.replace(/</g, '&lt;')}</pre>`;
  }

  private getEditorBundleDir(bundleId: string) {
    return path.join(this.getUploadDir(), 'editor', bundleId);
  }

  private createEditorBundleId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /** Open PDF/DOCX in format-preserved editor (PDF auto-converts to exact DOCX first) */
  async openFormatEditor(userId: string, fileId: string) {
    if (!isLibreOfficeAvailable()) {
      throw new BadRequestException(
        'Format-preserved editing requires LibreOffice. Install: brew install --cask libreoffice',
      );
    }

    const source = await this.findUserFile(userId, fileId);
    const ext = path.extname(source.originalName).toLowerCase();
    let editable = source;

    if (ext === '.pdf' || source.mimetype === 'application/pdf') {
      editable = await this.convertPdfForEditor(userId, source);
    } else if (!['.docx', '.doc'].includes(ext) && !source.mimetype.includes('word')) {
      throw new BadRequestException('Format editor supports PDF and Word files only');
    }

    const bundleId = this.createEditorBundleId();
    const bundleDir = this.getEditorBundleDir(bundleId);
    const { htmlPath, html, htmlFileName } = await exportDocxToHtmlBundle(editable.path, bundleDir);
    saveOriginalDocxToBundle(editable.path, bundleDir);

    const originalDocxBuffer = fs.readFileSync(path.join(bundleDir, 'original.docx'));
    const sourcePlainText = await extractPlainTextFromDocx(originalDocxBuffer);
    fs.writeFileSync(path.join(bundleDir, 'source-plain.txt'), sourcePlainText, 'utf-8');

    const bundleBaseUrl = `/uploads/editor/${bundleId}/`;
    const browserHtml = sanitizeLibreOfficeHtmlForBrowser(html, bundleBaseUrl);
    const viewHtml = injectEditorChrome(browserHtml);
    const viewFileName = 'editor-view.html';
    fs.writeFileSync(path.join(bundleDir, viewFileName), viewHtml, 'utf-8');

    const editorPlainText = plainTextFromEditorHtml(viewHtml);
    fs.writeFileSync(path.join(bundleDir, 'editor-plain.txt'), editorPlainText, 'utf-8');

    const meta: EditorBundleMeta = {
      sourceFileId: source.id,
      editableFileId: editable.id,
      htmlFileName,
      sourcePlainText,
      editorPlainText,
    };
    fs.writeFileSync(path.join(bundleDir, 'meta.json'), JSON.stringify(meta), 'utf-8');

    const parsed = parseLibreOfficeHtml(html);

    return {
      sourceFile: source,
      editableFile: editable,
      editBundleId: bundleId,
      htmlPath: path.basename(htmlPath),
      htmlFileName,
      editorUrl: `/uploads/editor/${bundleId}/${viewFileName}`,
      docxUrl: `/uploads/editor/${bundleId}/original.docx`,
      styles: parsed.styles,
      body: parsed.body,
      title: parsed.title,
      formatPreserved: true,
      message:
        ext === '.pdf'
          ? 'PDF converted to Word for editing — layout preserved. Edit below, then save.'
          : 'Document opened with original formatting. Edit below, then save.',
    };
  }

  /** Save format editor HTML back to exact DOCX (and optional PDF) */
  async saveFormatEditor(
    userId: string,
    fileId: string,
    html: string,
    editBundleId: string,
    exportPdf = false,
    clientBaselinePlain?: string,
    clientEditedPlain?: string,
  ) {
    if (!isLibreOfficeAvailable()) {
      throw new BadRequestException('LibreOffice required to save with format preserved');
    }

    const bundleDir = this.getEditorBundleDir(editBundleId);
    if (!fs.existsSync(bundleDir)) {
      throw new BadRequestException('Editor session expired — please reopen the document');
    }

    const metaPath = path.join(bundleDir, 'meta.json');
    let meta: EditorBundleMeta | null = null;
    if (fs.existsSync(metaPath)) {
      meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8')) as EditorBundleMeta;
    }

    const source = await this.findUserFile(userId, meta?.sourceFileId || fileId);
    const originalDocxPath = path.join(bundleDir, 'original.docx');
    if (!fs.existsSync(originalDocxPath)) {
      throw new BadRequestException('Original document missing — please reopen and try again');
    }

    const originalDocxBuffer = fs.readFileSync(originalDocxPath);
    const sourcePlainPath = path.join(bundleDir, 'source-plain.txt');
    const sourcePlainText = fs.existsSync(sourcePlainPath)
      ? fs.readFileSync(sourcePlainPath, 'utf-8')
      : meta?.sourcePlainText || (await extractPlainTextFromDocx(originalDocxBuffer));

    const editorPlainPath = path.join(bundleDir, 'editor-plain.txt');
    const baselinePlainText = normalizeEditorText(
      clientBaselinePlain ||
        (fs.existsSync(editorPlainPath)
          ? fs.readFileSync(editorPlainPath, 'utf-8')
          : meta?.editorPlainText || ''),
    );
    const editedPlainText = normalizeEditorText(
      clientEditedPlain || plainTextFromEditorHtml(html),
    );

    if (!baselinePlainText) {
      throw new BadRequestException('Editor baseline missing — please reopen the document');
    }

    const editsDetected = baselinePlainText !== editedPlainText;
    let { buffer: docxBuffer, applied: patchApplied } = await patchDocxPreservingFormat(
      originalDocxBuffer,
      baselinePlainText,
      editedPlainText,
    );

    if (editsDetected && !patchApplied) {
      const htmlFileName = meta?.htmlFileName || 'document.html';
      const cleaned = stripEditorArtifacts(html);
      const parsed = parseLibreOfficeHtml(cleaned);
      const cleanedBody = sanitizeEditorHtml(parsed.body || cleaned);
      const body = rewriteEditorAssetUrls(cleanedBody, editBundleId, 'relative');
      const fullHtml = buildLibreOfficeHtml(
        parsed.styles,
        body,
        parsed.title,
        parsed.bodyAttrs,
      );
      const htmlFile = path.join(bundleDir, htmlFileName);
      fs.writeFileSync(htmlFile, fullHtml, 'utf-8');
      docxBuffer = await importHtmlFileToDocx(htmlFile);
      patchApplied = true;
    }

    const editsApplied = editsDetected && patchApplied;
    const baseName = path
      .basename(source.originalName, path.extname(source.originalName))
      .replace(/[^a-zA-Z0-9-_.]/g, '-');

    const savedDocx = await this.saveConvertedFile(
      userId,
      `${baseName}-edited.docx`,
      docxBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      source.id,
      'exact',
    );

    let savedPdf: Awaited<ReturnType<typeof this.saveConvertedFile>> | null = null;
    if (exportPdf) {
      const tempDocx = path.join(bundleDir, 'saved-output.docx');
      fs.writeFileSync(tempDocx, docxBuffer);
      const pdfBuffer = await exportDocxFileToPdf(tempDocx);
      savedPdf = await this.saveConvertedFile(
        userId,
        `${baseName}-edited.pdf`,
        pdfBuffer,
        'application/pdf',
        source.id,
        'exact',
      );
    }

    return {
      docx: savedDocx,
      pdf: savedPdf,
      editsApplied,
      message: !editsApplied
        ? exportPdf
          ? 'Saved PDF (no text changes detected)'
          : 'Saved Word file (no text changes detected)'
        : exportPdf
          ? 'Saved your edits — layout preserved (Word + PDF)'
          : 'Saved your edits — layout preserved (Word DOCX)',
    };
  }

  async prepareForEdit(userId: string, fileId: string) {
    const source = await this.findUserFile(userId, fileId);
    const ext = path.extname(source.originalName).toLowerCase();

    if (ext === '.pdf' || source.mimetype === 'application/pdf') {
      if (!isLibreOfficeAvailable()) {
        throw new BadRequestException(
          'PDF editing requires LibreOffice. Convert to Word first or install: brew install --cask libreoffice',
        );
      }

      const converted = await this.convertExactFormat(userId, source, 'docx');
      const extraction = await this.extractText(userId, converted.id);

      return {
        sourceFile: source,
        editableFile: converted,
        text: extraction.text,
        hasGarbage: extraction.hasGarbage,
        method: extraction.method,
        message:
          'PDF converted to Word for clean editing. Save will produce a DOCX file.',
      };
    }

    const extraction = await this.extractText(userId, fileId);
    return {
      sourceFile: source,
      editableFile: source,
      text: extraction.text,
      hasGarbage: extraction.hasGarbage,
      method: extraction.method,
      message: 'Document ready for text editing.',
    };
  }

  async convertFile(
    userId: string,
    fileId: string,
    targetFormat: 'pdf' | 'docx',
    mode: ConvertMode = 'exact',
  ) {
    const source = await this.findUserFile(userId, fileId);

    if (mode === 'exact') {
      if (!isLibreOfficeAvailable()) {
        throw new BadRequestException(
          'Exact format requires LibreOffice. Install: brew install --cask libreoffice — then restart server.',
        );
      }
      return this.convertExactFormat(userId, source, targetFormat);
    }

    if (mode === 'rich') {
      return this.convertRichFormat(userId, source, targetFormat);
    }

    return this.convertTextOnly(userId, source, targetFormat);
  }

  private async convertPdfForEditor(
    userId: string,
    source: { id: string; path: string; originalName: string },
  ) {
    const baseName = path
      .basename(source.originalName, path.extname(source.originalName))
      .replace(/[^a-zA-Z0-9-_.]/g, '-');

    let outputBuffer: Buffer;

    // pdf2docx keeps resume/column layouts much better than LibreOffice PDF import
    if (await isPdf2DocxAvailable()) {
      try {
        outputBuffer = await convertPdfToDocxWithPdf2Docx(source.path);
      } catch {
        outputBuffer = await convertDocumentExact(
          source.path,
          source.originalName,
          'docx',
        );
      }
    } else {
      outputBuffer = await convertDocumentExact(
        source.path,
        source.originalName,
        'docx',
      );
    }

    return this.saveConvertedFile(
      userId,
      `${baseName}-editable.docx`,
      outputBuffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      source.id,
      'exact',
    );
  }

  private async convertExactFormat(
    userId: string,
    source: { id: string; path: string; originalName: string },
    targetFormat: 'pdf' | 'docx',
  ) {
    const srcExt = path.extname(source.originalName).toLowerCase();

    if (targetFormat === 'pdf' && !['.doc', '.docx', '.txt'].includes(srcExt)) {
      throw new BadRequestException('Exact DOC→PDF needs a Word or text file');
    }
    if (targetFormat === 'docx' && srcExt !== '.pdf') {
      throw new BadRequestException('Exact PDF→DOCX needs a PDF file');
    }

    let outputBuffer: Buffer;

    if (targetFormat === 'docx' && srcExt === '.pdf' && (await isPdf2DocxAvailable())) {
      try {
        outputBuffer = await convertPdfToDocxWithPdf2Docx(source.path);
      } catch {
        outputBuffer = await convertDocumentExact(
          source.path,
          source.originalName,
          targetFormat,
        );
      }
    } else {
      outputBuffer = await convertDocumentExact(
        source.path,
        source.originalName,
        targetFormat,
      );
    }

    const baseName = path
      .basename(source.originalName, path.extname(source.originalName))
      .replace(/[^a-zA-Z0-9-_.]/g, '-');

    const mimetype =
      targetFormat === 'pdf'
        ? 'application/pdf'
        : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    return this.saveConvertedFile(
      userId,
      `${baseName}.${targetFormat}`,
      outputBuffer,
      mimetype,
      source.id,
      'exact',
    );
  }

  private async convertRichFormat(
    userId: string,
    source: { id: string; path: string; originalName: string },
    targetFormat: 'pdf' | 'docx',
  ) {
    const srcExt = path.extname(source.originalName).toLowerCase();
    const baseName = path
      .basename(source.originalName, path.extname(source.originalName))
      .replace(/[^a-zA-Z0-9-_.]/g, '-');

    if (targetFormat === 'docx') {
      if (srcExt === '.pdf' && isLibreOfficeAvailable()) {
        return this.convertExactFormat(userId, source, 'docx');
      }
      if (['.doc', '.docx'].includes(srcExt)) {
        const buffer = fs.readFileSync(source.path);
        const { value: html } = await mammoth.convertToHtml(
          { buffer },
          {
            includeDefaultStyleMap: true,
            ignoreEmptyParagraphs: false,
          },
        );
        return this.createDocxFromHtml(userId, baseName, html, source.id);
      }
    }

    if (targetFormat === 'pdf') {
      if (['.doc', '.docx'].includes(srcExt) && isLibreOfficeAvailable()) {
        return this.convertExactFormat(userId, source, 'pdf');
      }
      const { text } = await this.extractText(userId, source.id);
      return this.createPdfFromText(userId, baseName, text, source.id, 'rich');
    }

    return this.convertTextOnly(userId, source, targetFormat);
  }

  private async convertTextOnly(
    userId: string,
    source: { id: string; originalName: string },
    targetFormat: 'pdf' | 'docx',
  ) {
    const { text } = await this.extractText(userId, source.id);
    const baseName = path
      .basename(source.originalName, path.extname(source.originalName))
      .replace(/[^a-zA-Z0-9-_]/g, '-');

    if (targetFormat === 'docx') {
      return this.createDocxFromText(userId, baseName, text, source.id, 'text');
    }
    return this.createPdfFromText(userId, baseName, text, source.id, 'text');
  }

  async editFileContent(userId: string, fileId: string, content: string) {
    const source = await this.findUserFile(userId, fileId);
    const ext = path.extname(source.originalName).toLowerCase();
    const baseName = path.basename(source.originalName, ext);
    const cleaned = cleanPdfExtractedText(content);

    if (ext === '.pdf') {
      return this.createDocxFromText(
        userId,
        `${baseName}-edited`,
        cleaned,
        source.id,
        'rich',
      );
    }
    if (['.docx', '.doc'].includes(ext)) {
      return this.createDocxFromText(userId, `${baseName}-edited`, cleaned, source.id, 'rich');
    }
    if (ext === '.txt') {
      return this.saveTextFile(userId, `${baseName}-edited.txt`, cleaned, source.id);
    }

    throw new BadRequestException('Editing supports PDF, DOC, DOCX, and TXT files');
  }

  private async extractPdfText(
    filePath: string,
    buffer: Buffer,
  ): Promise<TextExtractionResult> {
    const loText = await this.extractPdfTextViaLibreOffice(filePath);
    if (loText) {
      const cleaned = cleanPdfExtractedText(loText);
      return {
        text: cleaned,
        hasGarbage: hasPdfGarbage(loText),
        method: 'libreoffice',
      };
    }

    const raw = await this.parsePdfTextRaw(buffer);
    const cleaned = cleanPdfExtractedText(raw);
    return {
      text: cleaned,
      hasGarbage: hasPdfGarbage(raw),
      method: 'pdf-parse',
    };
  }

  private async extractPdfTextViaLibreOffice(filePath: string): Promise<string | null> {
    if (!isLibreOfficeAvailable()) return null;
    try {
      const docxBuffer = await convertDocumentExact(filePath, path.basename(filePath), 'docx');
      const result = await mammoth.extractRawText({ buffer: docxBuffer });
      return result.value?.trim() || null;
    } catch {
      return null;
    }
  }

  private async extractPdfHtmlViaLibreOffice(filePath: string): Promise<string | null> {
    if (!isLibreOfficeAvailable()) return null;
    try {
      const docxBuffer = await convertDocumentExact(filePath, path.basename(filePath), 'docx');
      const result = await mammoth.convertToHtml({ buffer: docxBuffer });
      return result.value || null;
    } catch {
      return null;
    }
  }

  private async parsePdfTextRaw(buffer: Buffer): Promise<string> {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse');
    const parsed = await pdfParse(buffer);
    return parsed.text?.trim() || '';
  }

  private async createDocxFromHtml(
    userId: string,
    baseName: string,
    html: string,
    sourceFileId: string,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const HTMLtoDOCX = require('html-to-docx');
    const wrappedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
    const buffer = await HTMLtoDOCX(wrappedHtml, null, {
      font: 'Arial Unicode MS',
      fontSize: 11,
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
    });
    return this.saveConvertedFile(
      userId,
      `${baseName}.docx`,
      Buffer.from(buffer),
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sourceFileId,
      'rich',
    );
  }

  private async createDocxFromText(
    userId: string,
    baseName: string,
    text: string,
    sourceFileId: string,
    mode: ConvertMode = 'text',
  ) {
    const paragraphs = (text || ' ').split(/\n/).map(
      (line) =>
        new Paragraph({
          children: [
            new TextRun({
              text: line || ' ',
              font: 'Arial Unicode MS',
            }),
          ],
        }),
    );

    const doc = new Document({ sections: [{ children: paragraphs }] });
    const buffer = await Packer.toBuffer(doc);
    return this.saveConvertedFile(
      userId,
      `${baseName}.docx`,
      buffer,
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      sourceFileId,
      mode,
    );
  }

  private async createPdfFromText(
    userId: string,
    baseName: string,
    text: string,
    sourceFileId: string,
    mode: ConvertMode = 'text',
  ) {
    const buffer = await new Promise<Buffer>((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, autoFirstPage: true });
      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const unicodeFont = findUnicodeFont();
      if (unicodeFont) {
        doc.registerFont('UnicodeFont', unicodeFont);
        doc.font('UnicodeFont');
      }

      const lines = (text || '').split(/\n/);
      for (const line of lines) {
        try {
          doc.text(line || ' ', { lineGap: 4, align: 'left' });
        } catch {
          doc.text(line.replace(/[^\x00-\x7F]/g, '?') || ' ', { lineGap: 4 });
        }
      }
      doc.end();
    });

    return this.saveConvertedFile(
      userId,
      `${baseName}.pdf`,
      buffer,
      'application/pdf',
      sourceFileId,
      mode,
    );
  }

  private async saveTextFile(
    userId: string,
    filename: string,
    content: string,
    sourceFileId: string,
  ) {
    const buffer = Buffer.from(content, 'utf-8');
    return this.saveConvertedFile(userId, filename, buffer, 'text/plain', sourceFileId, 'text');
  }

  private async saveConvertedFile(
    userId: string,
    originalName: string,
    buffer: Buffer,
    mimetype: string,
    sourceFileId: string,
    mode: ConvertMode = 'exact',
  ) {
    const uploadDir = this.getUploadDir();
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-converted-${originalName}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, buffer);

    return this.prisma.file.create({
      data: {
        userId,
        originalName,
        filename,
        mimetype,
        size: buffer.length,
        path: filePath,
        url: `/uploads/${filename}`,
        metadata: { convertedFrom: sourceFileId, conversionMode: mode },
      },
    });
  }
}