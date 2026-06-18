import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

const execFileAsync = promisify(execFile);

function resolvePython3(): string {
  const venvPython = path.join(process.cwd(), '.venv-pdf2docx', 'bin', 'python3');
  if (fs.existsSync(venvPython)) return venvPython;
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

export async function isPdf2DocxAvailable(): Promise<boolean> {
  const python = resolvePython3();
  try {
    await execFileAsync(python, ['-c', 'import pdf2docx'], { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

export async function convertPdfToDocxWithPdf2Docx(inputPath: string): Promise<Buffer> {
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
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}