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
Object.defineProperty(exports, "__esModule", { value: true });
exports.findLibreOfficeBinary = findLibreOfficeBinary;
exports.isLibreOfficeAvailable = isLibreOfficeAvailable;
exports.convertDocumentExact = convertDocumentExact;
exports.decodeUploadFilename = decodeUploadFilename;
exports.exportDocxToHtmlBundle = exportDocxToHtmlBundle;
exports.importHtmlFileToDocx = importHtmlFileToDocx;
exports.exportDocxFileToPdf = exportDocxFileToPdf;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
const SOFFICE_PATHS = [
    process.env.LIBREOFFICE_PATH,
    '/Applications/LibreOffice.app/Contents/MacOS/soffice',
    '/usr/bin/libreoffice',
    '/usr/bin/soffice',
    '/usr/local/bin/soffice',
    'C:\\Program Files\\LibreOffice\\program\\soffice.exe',
].filter(Boolean);
const LO_ENV = {
    ...process.env,
    LANG: 'en_US.UTF-8',
    LC_ALL: 'en_US.UTF-8',
    LANGUAGE: 'en_US.UTF-8',
    SAL_USE_VCLPLUGIN: 'gen',
};
const PDF_EXPORT_FILTER = 'pdf:writer_pdf_Export:{"EmbedStandardFonts":{"type":"boolean","value":"true"},"UseTaggedPDF":{"type":"boolean","value":"true"},"SelectPdfVersion":{"type":"long","value":"1"}}';
const DOCX_EXPORT_FILTER = 'docx:MS Word 2007 XML';
function findLibreOfficeBinary() {
    for (const candidate of SOFFICE_PATHS) {
        if (fs.existsSync(candidate))
            return candidate;
    }
    return null;
}
function isLibreOfficeAvailable() {
    return findLibreOfficeBinary() !== null;
}
function loBaseArgs(profileDir) {
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
async function runLibreOffice(args, profileDir) {
    const soffice = findLibreOfficeBinary();
    if (!soffice)
        throw new Error('LibreOffice not installed');
    fs.mkdirSync(profileDir, { recursive: true });
    await execFileAsync(soffice, [...loBaseArgs(profileDir), ...args], {
        timeout: 180000,
        maxBuffer: 80 * 1024 * 1024,
        env: LO_ENV,
    });
}
function readOutput(tmpDir, targetExt, baseName) {
    const expected = path.join(tmpDir, `${baseName}.${targetExt}`);
    if (fs.existsSync(expected))
        return fs.readFileSync(expected);
    const files = fs.readdirSync(tmpDir);
    const match = files.find((f) => f.endsWith(`.${targetExt}`));
    if (!match)
        throw new Error(`LibreOffice produced no .${targetExt} file`);
    return fs.readFileSync(path.join(tmpDir, match));
}
function stageInputForLibreOffice(inputPath, workDir, sourceExt) {
    const baseName = `lm-input-${Date.now()}`;
    const stagedPath = path.join(workDir, `${baseName}${sourceExt}`);
    fs.copyFileSync(inputPath, stagedPath);
    return { stagedPath, baseName };
}
async function convertWithExec(inputPath, targetExt, sourceExt) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-lo-'));
    const profileDir = path.join(tmpDir, 'profile');
    const workDir = path.join(tmpDir, 'work');
    fs.mkdirSync(workDir);
    try {
        const { stagedPath, baseName } = stageInputForLibreOffice(inputPath, workDir, sourceExt);
        if (targetExt === 'docx' && sourceExt === '.pdf') {
            await runLibreOffice([
                '--infilter=writer_pdf_import',
                '--convert-to',
                DOCX_EXPORT_FILTER,
                '--outdir',
                workDir,
                stagedPath,
            ], profileDir);
            return readOutput(workDir, 'docx', baseName);
        }
        const filter = targetExt === 'pdf' ? PDF_EXPORT_FILTER : DOCX_EXPORT_FILTER;
        const infilter = sourceExt === '.pdf' && targetExt === 'pdf'
            ? []
            : sourceExt === '.doc'
                ? ['--infilter', 'MS Word 97']
                : [];
        await runLibreOffice([
            ...infilter,
            '--convert-to',
            filter,
            '--outdir',
            workDir,
            stagedPath,
        ], profileDir);
        return readOutput(workDir, targetExt, baseName);
    }
    finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}
async function convertWithNpm(inputBuffer, targetExt) {
    const libre = require('libreoffice-convert');
    const convertAsync = (0, util_1.promisify)(libre.convert);
    return convertAsync(inputBuffer, targetExt, undefined);
}
async function convertDocumentExact(inputPath, originalName, targetFormat) {
    const inputExt = (path.extname(originalName) || path.extname(inputPath)).toLowerCase();
    try {
        return await convertWithExec(inputPath, targetFormat, inputExt);
    }
    catch (execErr) {
        const inputBuffer = fs.readFileSync(inputPath);
        const outExt = targetFormat === 'pdf' ? '.pdf' : '.docx';
        try {
            return await convertWithNpm(inputBuffer, outExt);
        }
        catch {
            throw execErr;
        }
    }
}
function decodeUploadFilename(name) {
    try {
        const decoded = Buffer.from(name, 'latin1').toString('utf8');
        return decoded.includes('\uFFFD') ? name : decoded;
    }
    catch {
        return name;
    }
}
async function convertFileOnDisk(inputPath, targetExt, workDir, profileDir, extraArgs = []) {
    const filter = targetExt === 'pdf'
        ? PDF_EXPORT_FILTER
        : targetExt === 'docx'
            ? DOCX_EXPORT_FILTER
            : 'html:HTML';
    await runLibreOffice([
        ...extraArgs,
        '--convert-to',
        filter,
        '--outdir',
        workDir,
        inputPath,
    ], profileDir);
    const baseName = path.basename(inputPath, path.extname(inputPath));
    const expected = path.join(workDir, `${baseName}.${targetExt}`);
    if (fs.existsSync(expected))
        return expected;
    const match = fs.readdirSync(workDir).find((f) => f.endsWith(`.${targetExt}`));
    if (!match)
        throw new Error(`LibreOffice produced no .${targetExt} file`);
    return path.join(workDir, match);
}
function copyDirectoryRecursive(src, dest, skipNames = new Set()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        if (skipNames.has(entry.name))
            continue;
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDirectoryRecursive(srcPath, destPath);
        }
        else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}
async function exportDocxToHtmlBundle(docxPath, bundleDir) {
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
        copyDirectoryRecursive(workDir, bundleDir, new Set([path.basename(staged)]));
        return {
            htmlPath: destHtml,
            html: fs.readFileSync(destHtml, 'utf-8'),
            htmlFileName: htmlName,
        };
    }
    finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}
async function importHtmlFileToDocx(htmlPath) {
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
        copyDirectoryRecursive(bundleDir, workDir, new Set(['meta.json']));
        const stagedHtml = path.join(workDir, htmlName);
        if (!fs.existsSync(stagedHtml)) {
            fs.copyFileSync(htmlPath, stagedHtml);
        }
        const docxPath = await convertFileOnDisk(stagedHtml, 'docx', workDir, profileDir, ['--infilter=HTML (StarWriter)']);
        return fs.readFileSync(docxPath);
    }
    finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}
async function exportDocxFileToPdf(docxPath) {
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
    }
    finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}
//# sourceMappingURL=libreoffice.helper.js.map