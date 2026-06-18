"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const docx_1 = require("docx");
const pdfkit_1 = __importDefault(require("pdfkit"));
const mammoth_1 = __importDefault(require("mammoth"));
const libreoffice_helper_1 = require("./libreoffice.helper");
const html_editor_helper_1 = require("./html-editor.helper");
const unicode_font_helper_1 = require("./unicode-font.helper");
const pdf2docx_helper_1 = require("./pdf2docx.helper");
const text_cleanup_helper_1 = require("./text-cleanup.helper");
const docx_patch_helper_1 = require("./docx-patch.helper");
let FilesService = class FilesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    getUploadDir() {
        return process.env.UPLOAD_DIR || './uploads';
    }
    isConvertibleName(name, mimetype) {
        const ext = path.extname(name).toLowerCase();
        return (['.pdf', '.docx', '.doc', '.txt'].includes(ext) ||
            mimetype === 'application/pdf' ||
            mimetype?.includes('word') ||
            mimetype === 'text/plain');
    }
    async getConverterCapabilities() {
        const lo = (0, libreoffice_helper_1.isLibreOfficeAvailable)();
        const p2d = await (0, pdf2docx_helper_1.isPdf2DocxAvailable)();
        return {
            libreOfficeInstalled: lo,
            pdf2docxAvailable: p2d,
            exactFormatAvailable: lo,
            unicodeFontAvailable: !!(0, unicode_font_helper_1.findUnicodeFont)(),
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
    validateConvertibleUpload(file) {
        if (!this.isConvertibleName(file.originalname, file.mimetype)) {
            throw new common_1.BadRequestException('Only PDF, DOC, DOCX, and TXT files can be uploaded for conversion');
        }
    }
    async saveUploadedFile(userId, file) {
        const uploadDir = this.getUploadDir();
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const originalName = (0, libreoffice_helper_1.decodeUploadFilename)(file.originalname);
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
    async uploadAndConvert(userId, file, targetFormat, mode = 'exact') {
        this.validateConvertibleUpload(file);
        const source = await this.saveUploadedFile(userId, file);
        const converted = await this.convertFile(userId, source.id, targetFormat, mode);
        return { source, converted };
    }
    async findUserFiles(userId) {
        return this.prisma.file.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findUserFile(userId, fileId) {
        const file = await this.prisma.file.findFirst({
            where: { id: fileId, userId },
        });
        if (!file)
            throw new common_1.NotFoundException('File not found');
        if (!fs.existsSync(file.path)) {
            throw new common_1.NotFoundException('File missing on disk');
        }
        return file;
    }
    async getFileDownload(userId, fileId) {
        const file = await this.findUserFile(userId, fileId);
        return {
            stream: fs.createReadStream(file.path),
            filename: file.originalName,
            mimetype: file.mimetype || 'application/octet-stream',
            size: file.size,
        };
    }
    async extractText(userId, fileId) {
        const file = await this.findUserFile(userId, fileId);
        const buffer = fs.readFileSync(file.path);
        const ext = path.extname(file.originalName).toLowerCase();
        if (ext === '.pdf' || file.mimetype === 'application/pdf') {
            return this.extractPdfText(file.path, buffer);
        }
        if (['.docx', '.doc'].includes(ext) || file.mimetype.includes('word')) {
            const result = await mammoth_1.default.extractRawText({ buffer });
            const text = result.value?.trim() || '';
            return { text, hasGarbage: false, method: 'mammoth' };
        }
        if (ext === '.txt' || file.mimetype === 'text/plain') {
            return { text: buffer.toString('utf-8'), hasGarbage: false, method: 'plain' };
        }
        throw new common_1.BadRequestException('Text extraction supports PDF, DOC, DOCX, and TXT files only');
    }
    async extractHtml(userId, fileId) {
        const file = await this.findUserFile(userId, fileId);
        const buffer = fs.readFileSync(file.path);
        const ext = path.extname(file.originalName).toLowerCase();
        if (['.docx', '.doc'].includes(ext) || file.mimetype.includes('word')) {
            const result = await mammoth_1.default.convertToHtml({ buffer });
            return (0, text_cleanup_helper_1.cleanHtmlExtracted)(result.value || '');
        }
        if (ext === '.pdf' || file.mimetype === 'application/pdf') {
            const loHtml = await this.extractPdfHtmlViaLibreOffice(file.path);
            if (loHtml)
                return (0, text_cleanup_helper_1.cleanHtmlExtracted)(loHtml);
            const { text } = await this.extractPdfText(file.path, buffer);
            return text
                .split(/\n/)
                .map((line) => `<p>${line.replace(/</g, '&lt;') || '&nbsp;'}</p>`)
                .join('');
        }
        const { text } = await this.extractText(userId, fileId);
        return `<pre>${text.replace(/</g, '&lt;')}</pre>`;
    }
    getEditorBundleDir(bundleId) {
        return path.join(this.getUploadDir(), 'editor', bundleId);
    }
    createEditorBundleId() {
        return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    }
    async openFormatEditor(userId, fileId) {
        if (!(0, libreoffice_helper_1.isLibreOfficeAvailable)()) {
            throw new common_1.BadRequestException('Format-preserved editing requires LibreOffice. Install: brew install --cask libreoffice');
        }
        const source = await this.findUserFile(userId, fileId);
        const ext = path.extname(source.originalName).toLowerCase();
        let editable = source;
        if (ext === '.pdf' || source.mimetype === 'application/pdf') {
            editable = await this.convertPdfForEditor(userId, source);
        }
        else if (!['.docx', '.doc'].includes(ext) && !source.mimetype.includes('word')) {
            throw new common_1.BadRequestException('Format editor supports PDF and Word files only');
        }
        const bundleId = this.createEditorBundleId();
        const bundleDir = this.getEditorBundleDir(bundleId);
        const { htmlPath, html, htmlFileName } = await (0, libreoffice_helper_1.exportDocxToHtmlBundle)(editable.path, bundleDir);
        (0, docx_patch_helper_1.saveOriginalDocxToBundle)(editable.path, bundleDir);
        const originalDocxBuffer = fs.readFileSync(path.join(bundleDir, 'original.docx'));
        const sourcePlainText = await (0, docx_patch_helper_1.extractPlainTextFromDocx)(originalDocxBuffer);
        fs.writeFileSync(path.join(bundleDir, 'source-plain.txt'), sourcePlainText, 'utf-8');
        const bundleBaseUrl = `/uploads/editor/${bundleId}/`;
        const browserHtml = (0, html_editor_helper_1.sanitizeLibreOfficeHtmlForBrowser)(html, bundleBaseUrl);
        const viewHtml = (0, html_editor_helper_1.injectEditorChrome)(browserHtml);
        const viewFileName = 'editor-view.html';
        fs.writeFileSync(path.join(bundleDir, viewFileName), viewHtml, 'utf-8');
        const editorPlainText = (0, docx_patch_helper_1.plainTextFromEditorHtml)(viewHtml);
        fs.writeFileSync(path.join(bundleDir, 'editor-plain.txt'), editorPlainText, 'utf-8');
        const meta = {
            sourceFileId: source.id,
            editableFileId: editable.id,
            htmlFileName,
            sourcePlainText,
            editorPlainText,
        };
        fs.writeFileSync(path.join(bundleDir, 'meta.json'), JSON.stringify(meta), 'utf-8');
        const parsed = (0, html_editor_helper_1.parseLibreOfficeHtml)(html);
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
            message: ext === '.pdf'
                ? 'PDF converted to Word for editing — layout preserved. Edit below, then save.'
                : 'Document opened with original formatting. Edit below, then save.',
        };
    }
    async saveFormatEditor(userId, fileId, html, editBundleId, exportPdf = false, clientBaselinePlain, clientEditedPlain) {
        if (!(0, libreoffice_helper_1.isLibreOfficeAvailable)()) {
            throw new common_1.BadRequestException('LibreOffice required to save with format preserved');
        }
        const bundleDir = this.getEditorBundleDir(editBundleId);
        if (!fs.existsSync(bundleDir)) {
            throw new common_1.BadRequestException('Editor session expired — please reopen the document');
        }
        const metaPath = path.join(bundleDir, 'meta.json');
        let meta = null;
        if (fs.existsSync(metaPath)) {
            meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
        }
        const source = await this.findUserFile(userId, meta?.sourceFileId || fileId);
        const originalDocxPath = path.join(bundleDir, 'original.docx');
        if (!fs.existsSync(originalDocxPath)) {
            throw new common_1.BadRequestException('Original document missing — please reopen and try again');
        }
        const originalDocxBuffer = fs.readFileSync(originalDocxPath);
        const sourcePlainPath = path.join(bundleDir, 'source-plain.txt');
        const sourcePlainText = fs.existsSync(sourcePlainPath)
            ? fs.readFileSync(sourcePlainPath, 'utf-8')
            : meta?.sourcePlainText || (await (0, docx_patch_helper_1.extractPlainTextFromDocx)(originalDocxBuffer));
        const editorPlainPath = path.join(bundleDir, 'editor-plain.txt');
        const baselinePlainText = (0, docx_patch_helper_1.normalizeEditorText)(clientBaselinePlain ||
            (fs.existsSync(editorPlainPath)
                ? fs.readFileSync(editorPlainPath, 'utf-8')
                : meta?.editorPlainText || ''));
        const editedPlainText = (0, docx_patch_helper_1.normalizeEditorText)(clientEditedPlain || (0, docx_patch_helper_1.plainTextFromEditorHtml)(html));
        if (!baselinePlainText) {
            throw new common_1.BadRequestException('Editor baseline missing — please reopen the document');
        }
        const editsDetected = baselinePlainText !== editedPlainText;
        let { buffer: docxBuffer, applied: patchApplied } = await (0, docx_patch_helper_1.patchDocxPreservingFormat)(originalDocxBuffer, baselinePlainText, editedPlainText);
        if (editsDetected && !patchApplied) {
            const htmlFileName = meta?.htmlFileName || 'document.html';
            const cleaned = (0, html_editor_helper_1.stripEditorArtifacts)(html);
            const parsed = (0, html_editor_helper_1.parseLibreOfficeHtml)(cleaned);
            const cleanedBody = (0, html_editor_helper_1.sanitizeEditorHtml)(parsed.body || cleaned);
            const body = (0, html_editor_helper_1.rewriteEditorAssetUrls)(cleanedBody, editBundleId, 'relative');
            const fullHtml = (0, html_editor_helper_1.buildLibreOfficeHtml)(parsed.styles, body, parsed.title, parsed.bodyAttrs);
            const htmlFile = path.join(bundleDir, htmlFileName);
            fs.writeFileSync(htmlFile, fullHtml, 'utf-8');
            docxBuffer = await (0, libreoffice_helper_1.importHtmlFileToDocx)(htmlFile);
            patchApplied = true;
        }
        const editsApplied = editsDetected && patchApplied;
        const baseName = path
            .basename(source.originalName, path.extname(source.originalName))
            .replace(/[^a-zA-Z0-9-_.]/g, '-');
        const savedDocx = await this.saveConvertedFile(userId, `${baseName}-edited.docx`, docxBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', source.id, 'exact');
        let savedPdf = null;
        if (exportPdf) {
            const tempDocx = path.join(bundleDir, 'saved-output.docx');
            fs.writeFileSync(tempDocx, docxBuffer);
            const pdfBuffer = await (0, libreoffice_helper_1.exportDocxFileToPdf)(tempDocx);
            savedPdf = await this.saveConvertedFile(userId, `${baseName}-edited.pdf`, pdfBuffer, 'application/pdf', source.id, 'exact');
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
    async prepareForEdit(userId, fileId) {
        const source = await this.findUserFile(userId, fileId);
        const ext = path.extname(source.originalName).toLowerCase();
        if (ext === '.pdf' || source.mimetype === 'application/pdf') {
            if (!(0, libreoffice_helper_1.isLibreOfficeAvailable)()) {
                throw new common_1.BadRequestException('PDF editing requires LibreOffice. Convert to Word first or install: brew install --cask libreoffice');
            }
            const converted = await this.convertExactFormat(userId, source, 'docx');
            const extraction = await this.extractText(userId, converted.id);
            return {
                sourceFile: source,
                editableFile: converted,
                text: extraction.text,
                hasGarbage: extraction.hasGarbage,
                method: extraction.method,
                message: 'PDF converted to Word for clean editing. Save will produce a DOCX file.',
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
    async convertFile(userId, fileId, targetFormat, mode = 'exact') {
        const source = await this.findUserFile(userId, fileId);
        if (mode === 'exact') {
            if (!(0, libreoffice_helper_1.isLibreOfficeAvailable)()) {
                throw new common_1.BadRequestException('Exact format requires LibreOffice. Install: brew install --cask libreoffice — then restart server.');
            }
            return this.convertExactFormat(userId, source, targetFormat);
        }
        if (mode === 'rich') {
            return this.convertRichFormat(userId, source, targetFormat);
        }
        return this.convertTextOnly(userId, source, targetFormat);
    }
    async convertPdfForEditor(userId, source) {
        const baseName = path
            .basename(source.originalName, path.extname(source.originalName))
            .replace(/[^a-zA-Z0-9-_.]/g, '-');
        let outputBuffer;
        if (await (0, pdf2docx_helper_1.isPdf2DocxAvailable)()) {
            try {
                outputBuffer = await (0, pdf2docx_helper_1.convertPdfToDocxWithPdf2Docx)(source.path);
            }
            catch {
                outputBuffer = await (0, libreoffice_helper_1.convertDocumentExact)(source.path, source.originalName, 'docx');
            }
        }
        else {
            outputBuffer = await (0, libreoffice_helper_1.convertDocumentExact)(source.path, source.originalName, 'docx');
        }
        return this.saveConvertedFile(userId, `${baseName}-editable.docx`, outputBuffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', source.id, 'exact');
    }
    async convertExactFormat(userId, source, targetFormat) {
        const srcExt = path.extname(source.originalName).toLowerCase();
        if (targetFormat === 'pdf' && !['.doc', '.docx', '.txt'].includes(srcExt)) {
            throw new common_1.BadRequestException('Exact DOC→PDF needs a Word or text file');
        }
        if (targetFormat === 'docx' && srcExt !== '.pdf') {
            throw new common_1.BadRequestException('Exact PDF→DOCX needs a PDF file');
        }
        let outputBuffer;
        if (targetFormat === 'docx' && srcExt === '.pdf' && (await (0, pdf2docx_helper_1.isPdf2DocxAvailable)())) {
            try {
                outputBuffer = await (0, pdf2docx_helper_1.convertPdfToDocxWithPdf2Docx)(source.path);
            }
            catch {
                outputBuffer = await (0, libreoffice_helper_1.convertDocumentExact)(source.path, source.originalName, targetFormat);
            }
        }
        else {
            outputBuffer = await (0, libreoffice_helper_1.convertDocumentExact)(source.path, source.originalName, targetFormat);
        }
        const baseName = path
            .basename(source.originalName, path.extname(source.originalName))
            .replace(/[^a-zA-Z0-9-_.]/g, '-');
        const mimetype = targetFormat === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
        return this.saveConvertedFile(userId, `${baseName}.${targetFormat}`, outputBuffer, mimetype, source.id, 'exact');
    }
    async convertRichFormat(userId, source, targetFormat) {
        const srcExt = path.extname(source.originalName).toLowerCase();
        const baseName = path
            .basename(source.originalName, path.extname(source.originalName))
            .replace(/[^a-zA-Z0-9-_.]/g, '-');
        if (targetFormat === 'docx') {
            if (srcExt === '.pdf' && (0, libreoffice_helper_1.isLibreOfficeAvailable)()) {
                return this.convertExactFormat(userId, source, 'docx');
            }
            if (['.doc', '.docx'].includes(srcExt)) {
                const buffer = fs.readFileSync(source.path);
                const { value: html } = await mammoth_1.default.convertToHtml({ buffer }, {
                    includeDefaultStyleMap: true,
                    ignoreEmptyParagraphs: false,
                });
                return this.createDocxFromHtml(userId, baseName, html, source.id);
            }
        }
        if (targetFormat === 'pdf') {
            if (['.doc', '.docx'].includes(srcExt) && (0, libreoffice_helper_1.isLibreOfficeAvailable)()) {
                return this.convertExactFormat(userId, source, 'pdf');
            }
            const { text } = await this.extractText(userId, source.id);
            return this.createPdfFromText(userId, baseName, text, source.id, 'rich');
        }
        return this.convertTextOnly(userId, source, targetFormat);
    }
    async convertTextOnly(userId, source, targetFormat) {
        const { text } = await this.extractText(userId, source.id);
        const baseName = path
            .basename(source.originalName, path.extname(source.originalName))
            .replace(/[^a-zA-Z0-9-_]/g, '-');
        if (targetFormat === 'docx') {
            return this.createDocxFromText(userId, baseName, text, source.id, 'text');
        }
        return this.createPdfFromText(userId, baseName, text, source.id, 'text');
    }
    async editFileContent(userId, fileId, content) {
        const source = await this.findUserFile(userId, fileId);
        const ext = path.extname(source.originalName).toLowerCase();
        const baseName = path.basename(source.originalName, ext);
        const cleaned = (0, text_cleanup_helper_1.cleanPdfExtractedText)(content);
        if (ext === '.pdf') {
            return this.createDocxFromText(userId, `${baseName}-edited`, cleaned, source.id, 'rich');
        }
        if (['.docx', '.doc'].includes(ext)) {
            return this.createDocxFromText(userId, `${baseName}-edited`, cleaned, source.id, 'rich');
        }
        if (ext === '.txt') {
            return this.saveTextFile(userId, `${baseName}-edited.txt`, cleaned, source.id);
        }
        throw new common_1.BadRequestException('Editing supports PDF, DOC, DOCX, and TXT files');
    }
    async extractPdfText(filePath, buffer) {
        const loText = await this.extractPdfTextViaLibreOffice(filePath);
        if (loText) {
            const cleaned = (0, text_cleanup_helper_1.cleanPdfExtractedText)(loText);
            return {
                text: cleaned,
                hasGarbage: (0, text_cleanup_helper_1.hasPdfGarbage)(loText),
                method: 'libreoffice',
            };
        }
        const raw = await this.parsePdfTextRaw(buffer);
        const cleaned = (0, text_cleanup_helper_1.cleanPdfExtractedText)(raw);
        return {
            text: cleaned,
            hasGarbage: (0, text_cleanup_helper_1.hasPdfGarbage)(raw),
            method: 'pdf-parse',
        };
    }
    async extractPdfTextViaLibreOffice(filePath) {
        if (!(0, libreoffice_helper_1.isLibreOfficeAvailable)())
            return null;
        try {
            const docxBuffer = await (0, libreoffice_helper_1.convertDocumentExact)(filePath, path.basename(filePath), 'docx');
            const result = await mammoth_1.default.extractRawText({ buffer: docxBuffer });
            return result.value?.trim() || null;
        }
        catch {
            return null;
        }
    }
    async extractPdfHtmlViaLibreOffice(filePath) {
        if (!(0, libreoffice_helper_1.isLibreOfficeAvailable)())
            return null;
        try {
            const docxBuffer = await (0, libreoffice_helper_1.convertDocumentExact)(filePath, path.basename(filePath), 'docx');
            const result = await mammoth_1.default.convertToHtml({ buffer: docxBuffer });
            return result.value || null;
        }
        catch {
            return null;
        }
    }
    async parsePdfTextRaw(buffer) {
        const pdfParse = require('pdf-parse');
        const parsed = await pdfParse(buffer);
        return parsed.text?.trim() || '';
    }
    async createDocxFromHtml(userId, baseName, html, sourceFileId) {
        const HTMLtoDOCX = require('html-to-docx');
        const wrappedHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body>${html}</body></html>`;
        const buffer = await HTMLtoDOCX(wrappedHtml, null, {
            font: 'Arial Unicode MS',
            fontSize: 11,
            table: { row: { cantSplit: true } },
            footer: false,
            pageNumber: false,
        });
        return this.saveConvertedFile(userId, `${baseName}.docx`, Buffer.from(buffer), 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sourceFileId, 'rich');
    }
    async createDocxFromText(userId, baseName, text, sourceFileId, mode = 'text') {
        const paragraphs = (text || ' ').split(/\n/).map((line) => new docx_1.Paragraph({
            children: [
                new docx_1.TextRun({
                    text: line || ' ',
                    font: 'Arial Unicode MS',
                }),
            ],
        }));
        const doc = new docx_1.Document({ sections: [{ children: paragraphs }] });
        const buffer = await docx_1.Packer.toBuffer(doc);
        return this.saveConvertedFile(userId, `${baseName}.docx`, buffer, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', sourceFileId, mode);
    }
    async createPdfFromText(userId, baseName, text, sourceFileId, mode = 'text') {
        const buffer = await new Promise((resolve, reject) => {
            const doc = new pdfkit_1.default({ margin: 50, autoFirstPage: true });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            const unicodeFont = (0, unicode_font_helper_1.findUnicodeFont)();
            if (unicodeFont) {
                doc.registerFont('UnicodeFont', unicodeFont);
                doc.font('UnicodeFont');
            }
            const lines = (text || '').split(/\n/);
            for (const line of lines) {
                try {
                    doc.text(line || ' ', { lineGap: 4, align: 'left' });
                }
                catch {
                    doc.text(line.replace(/[^\x00-\x7F]/g, '?') || ' ', { lineGap: 4 });
                }
            }
            doc.end();
        });
        return this.saveConvertedFile(userId, `${baseName}.pdf`, buffer, 'application/pdf', sourceFileId, mode);
    }
    async saveTextFile(userId, filename, content, sourceFileId) {
        const buffer = Buffer.from(content, 'utf-8');
        return this.saveConvertedFile(userId, filename, buffer, 'text/plain', sourceFileId, 'text');
    }
    async saveConvertedFile(userId, originalName, buffer, mimetype, sourceFileId, mode = 'exact') {
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
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FilesService);
//# sourceMappingURL=files.service.js.map