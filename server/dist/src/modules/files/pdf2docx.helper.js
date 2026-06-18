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
exports.isPdf2DocxAvailable = isPdf2DocxAvailable;
exports.convertPdfToDocxWithPdf2Docx = convertPdfToDocxWithPdf2Docx;
const child_process_1 = require("child_process");
const util_1 = require("util");
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const path = __importStar(require("path"));
const execFileAsync = (0, util_1.promisify)(child_process_1.execFile);
function resolvePython3() {
    const venvPython = path.join(process.cwd(), '.venv-pdf2docx', 'bin', 'python3');
    if (fs.existsSync(venvPython))
        return venvPython;
    return process.env.PDF2DOCX_PYTHON || 'python3';
}
const CONVERT_SCRIPT = `
import sys
from pdf2docx import Converter
pdf, docx = sys.argv[1], sys.argv[2]
cv = Converter(pdf)
cv.convert(docx, start=0, end=None)
cv.close()
`;
async function isPdf2DocxAvailable() {
    const python = resolvePython3();
    try {
        await execFileAsync(python, ['-c', 'import pdf2docx'], { timeout: 5000 });
        return true;
    }
    catch {
        return false;
    }
}
async function convertPdfToDocxWithPdf2Docx(inputPath) {
    const python = resolvePython3();
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'lm-p2d-'));
    const scriptPath = path.join(tmpDir, 'convert.py');
    const outPath = path.join(tmpDir, 'output.docx');
    fs.writeFileSync(scriptPath, CONVERT_SCRIPT);
    try {
        await execFileAsync(python, [scriptPath, inputPath, outPath], {
            timeout: 180000,
            maxBuffer: 50 * 1024 * 1024,
            env: { ...process.env, LANG: 'en_US.UTF-8', LC_ALL: 'en_US.UTF-8' },
        });
        if (!fs.existsSync(outPath)) {
            throw new Error('pdf2docx produced no output');
        }
        return fs.readFileSync(outPath);
    }
    finally {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    }
}
//# sourceMappingURL=pdf2docx.helper.js.map