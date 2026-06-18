import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const execFileAsync = promisify(execFile);

const SOFFICE_PATHS = [
  process.env.LIBREOFFICE_PATH,
  '/Applications/LibreOffice.app/Contents/MacOS/soffice',
  '/usr/bin/libreoffice',
  '/usr/bin/soffice',
  '/usr/local/bin/soffice',
  'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
].filter(Boolean) as string[];

const LO_ENV = {
  ...process.env,
  LANG: 'en_US.UTF-8',
  LC_ALL: 'en_US.UTF-8',
  LANGUAGE: 'en_US.UTF-8',
  SAL_USE_VCLPLUGIN: 'gen',
};

// Embed fonts + Unicode-friendly PDF export
const PDF_EXPORT_FILTER =
  'pdf:writer_pdf_Export:{"EmbedStandardFonts":{"type":"boolean","value":"true"},"UseTaggedPDF":{"type":"boolean","value":"true"},"SelectPdfVersion":{"type":"long","value":"1"}}';

const DOCX_EXPORT_FILTER = 'docx:MS Word 2007 XML';

export function findLibreOfficeBinary(): string | null {
  for (const candidate of SOFFICE_PATHS) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

export function isLibreOfficeAvailable(): boolean {
  return findLibreOfficeBinary() !== null;
}

function loBaseArgs(profileDir: string): string[] {
  const userInstall = `file://${profileDir}`;
  return [
    `-env:UserInstallation=${userInstall}`,
    '--headless',
    '--norestore',
    '--nolockcheck',
    '--nodefault',
    '--nofirststartwizard',
  ];
}

async function runLibreOffice(
  args: string[],
  profileDir: string,
): Promise<void> {
  const soffice = findLibreOfficeBinary();
  if (!soffice) throw new Error('LibreOffice not installed');

  fs.mkdirSync(profileDir, { recursive: true });

  await execFileAsync(soffice, [...loBaseArgs(profileDir), ...args], {
    timeout: 180000,
    maxBuffer: 80 * 1024 * 1024,
    env: LO_ENV,
  });
}

function readOutput(tmpDir: string, targetExt: string, baseName: string): Buffer {
  const expected = path.join(tmpDir, `${baseName}.${targetExt}`);
  if (fs.existsSync(expected)) return fs.readFileSync(expected);

  const files = fs.readdirSync(tmpDir);
  const match = files.find((f) => f.endsWith(`.${targetExt}`));
  if (!match) throw new Error(`LibreOffice produced no .${targetExt} file`);
  return fs.readFileSync(path.join(tmpDir, match));
}

function stageInputForLibreOffice(
  inputPath: string,
  workDir: string,
  sourceExt: string,
): { stagedPath: string; baseName: string } {
  const baseName = `lm-input-${Date.now()}`;
  const stagedPath = path.join(workDir, `${baseName}${sourceExt}`);
  fs.copyFileSync(inputPath, stagedPath);
  return { stagedPath, baseName };
}

async function convertWithExec(
  inputPath: string,
  targetExt: 'pdf' | 'docx',
  sourceExt: string,
): Promise<Buffer> {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-lo-'));
  const profileDir = path.join(tmpDir, 'profile');
  const workDir = path.join(tmpDir, 'work');
  fs.mkdirSync(workDir);

  try {
    const { stagedPath, baseName } = stageInputForLibreOffice(
      inputPath,
      workDir,
      sourceExt,
    );

    // PDF → DOCX: import as Writer document (preserves layout & Unicode)
    if (targetExt === 'docx' && sourceExt === '.pdf') {
      await runLibreOffice(
        [
          '--infilter=writer_pdf_import',
          '--convert-to',
          DOCX_EXPORT_FILTER,
          '--outdir',
          workDir,
          stagedPath,
        ],
        profileDir,
      );
      return readOutput(workDir, 'docx', baseName);
    }

    const filter = targetExt === 'pdf' ? PDF_EXPORT_FILTER : DOCX_EXPORT_FILTER;
    const infilter =
      sourceExt === '.pdf' && targetExt === 'pdf'
        ? []
        : sourceExt === '.doc'
          ? ['--infilter', 'MS Word 97']
          : [];

    await runLibreOffice(
      [
        ...infilter,
        '--convert-to',
        filter,
        '--outdir',
        workDir,
        stagedPath,
      ],
      profileDir,
    );

    return readOutput(workDir, targetExt, baseName);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

async function convertWithNpm(
  inputBuffer: Buffer,
  targetExt: '.pdf' | '.docx',
): Promise<Buffer> {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const libre = require('libreoffice-convert');
  const convertAsync = promisify(libre.convert);
  return convertAsync(inputBuffer, targetExt, undefined);
}

export async function convertDocumentExact(
  inputPath: string,
  originalName: string,
  targetFormat: 'pdf' | 'docx',
): Promise<Buffer> {
  const inputExt = (path.extname(originalName) || path.extname(inputPath)).toLowerCase();

  try {
    return await convertWithExec(inputPath, targetFormat, inputExt);
  } catch (execErr) {
    const inputBuffer = fs.readFileSync(inputPath);
    const outExt = targetFormat === 'pdf' ? '.pdf' : '.docx';
    try {
      return await convertWithNpm(inputBuffer, outExt);
    } catch {
      throw execErr;
    }
  }
}

export function decodeUploadFilename(name: string): string {
  try {
    const decoded = Buffer.from(name, 'latin1').toString('utf8');
    return decoded.includes('\uFFFD') ? name : decoded;
  } catch {
    return name;
  }
}

async function convertFileOnDisk(
  inputPath: string,
  targetExt: 'html' | 'docx' | 'pdf',
  workDir: string,
  profileDir: string,
  extraArgs: string[] = [],
): Promise<string> {
  const filter =
    targetExt === 'pdf'
      ? PDF_EXPORT_FILTER
      : targetExt === 'docx'
        ? DOCX_EXPORT_FILTER
        : 'html:HTML';

  await runLibreOffice(
    [
      ...extraArgs,
      '--convert-to',
      filter,
      '--outdir',
      workDir,
      inputPath,
    ],
    profileDir,
  );

  const baseName = path.basename(inputPath, path.extname(inputPath));
  const expected = path.join(workDir, `${baseName}.${targetExt}`);
  if (fs.existsSync(expected)) return expected;

  const match = fs.readdirSync(workDir).find((f) => f.endsWith(`.${targetExt}`));
  if (!match) throw new Error(`LibreOffice produced no .${targetExt} file`);
  return path.join(workDir, match);
}

function copyDirectoryRecursive(src: string, dest: string, skipNames: Set<string> = new Set()) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (skipNames.has(entry.name)) continue;
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirectoryRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/** DOCX → HTML folder (images + subfolders stay alongside HTML — required for round-trip) */
export async function exportDocxToHtmlBundle(
  docxPath: string,
  bundleDir: string,
): Promise<{ htmlPath: string; html: string; htmlFileName: string }> {
  if (!isLibreOfficeAvailable()) {
    throw new Error('LibreOffice not installed');
  }

  fs.mkdirSync(bundleDir, { recursive: true });
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-lo-html-'));
  const profileDir = path.join(tmpDir, 'profile');
  const workDir = path.join(tmpDir, 'work');
  fs.mkdirSync(workDir);

  try {
    const staged = path.join(workDir, `lm-doc-${Date.now()}.docx`);
    fs.copyFileSync(docxPath, staged);
    const htmlPath = await convertFileOnDisk(staged, 'html', workDir, profileDir);

    const htmlName = path.basename(htmlPath);
    const destHtml = path.join(bundleDir, htmlName);
    fs.copyFileSync(htmlPath, destHtml);

    // Copy ALL assets (images + *_files/ subfolders) — flat copy missed images before
    copyDirectoryRecursive(workDir, bundleDir, new Set([path.basename(staged)]));

    return {
      htmlPath: destHtml,
      html: fs.readFileSync(destHtml, 'utf-8'),
      htmlFileName: htmlName,
    };
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/** HTML file (with sibling images/subfolders) → DOCX buffer */
export async function importHtmlFileToDocx(htmlPath: string): Promise<Buffer> {
  if (!isLibreOfficeAvailable()) {
    throw new Error('LibreOffice not installed');
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-lo-html-'));
  const profileDir = path.join(tmpDir, 'profile');
  const workDir = path.join(tmpDir, 'work');
  fs.mkdirSync(workDir);

  try {
    const bundleDir = path.dirname(htmlPath);
    const htmlName = path.basename(htmlPath);

    // Copy entire bundle (HTML + image folders) into LibreOffice work dir
    copyDirectoryRecursive(bundleDir, workDir, new Set(['meta.json']));

    const stagedHtml = path.join(workDir, htmlName);
    if (!fs.existsSync(stagedHtml)) {
      fs.copyFileSync(htmlPath, stagedHtml);
    }

    const docxPath = await convertFileOnDisk(
      stagedHtml,
      'docx',
      workDir,
      profileDir,
      ['--infilter=HTML (StarWriter)'],
    );
    return fs.readFileSync(docxPath);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

/** DOCX file on disk → PDF buffer */
export async function exportDocxFileToPdf(docxPath: string): Promise<Buffer> {
  if (!isLibreOfficeAvailable()) {
    throw new Error('LibreOffice not installed');
  }

  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-lo-pdf-'));
  const profileDir = path.join(tmpDir, 'profile');
  const workDir = path.join(tmpDir, 'work');
  fs.mkdirSync(workDir);

  try {
    const staged = path.join(workDir, `lm-doc-${Date.now()}.docx`);
    fs.copyFileSync(docxPath, staged);
    const pdfPath = await convertFileOnDisk(staged, 'pdf', workDir, profileDir);
    return fs.readFileSync(pdfPath);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}