import * as fs from 'fs';
import JSZip from 'jszip';
import {
  buildLibreOfficeHtml,
  parseLibreOfficeHtml,
  sanitizeEditorHtml,
  stripEditorArtifacts,
} from './html-editor.helper';

const DOCX_XML_PARTS = [
  'word/document.xml',
  /^word\/header\d+\.xml$/,
  /^word\/footer\d+\.xml$/,
];

function escapeXmlText(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function normalizeEditorText(text: string): string {
  return (text || '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Plain text from editor iframe HTML (same path on open and save) */
export function plainTextFromEditorHtml(html: string): string {
  const cleaned = stripEditorArtifacts(html);
  const parsed = parseLibreOfficeHtml(cleaned);
  return normalizeEditorText(
    extractPlainTextFromHtml(
      buildLibreOfficeHtml(
        parsed.styles,
        sanitizeEditorHtml(parsed.body || cleaned),
        parsed.title,
        parsed.bodyAttrs,
      ),
    ),
  );
}

/** Plain text from HTML body (LibreOffice export or browser iframe) */
export function extractPlainTextFromHtml(html: string): string {
  let body = html || '';
  const bodyMatch = body.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) body = bodyMatch[1];

  return body
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export async function extractPlainTextFromDocx(docxBuffer: Buffer): Promise<string> {
  const zip = await JSZip.loadAsync(docxBuffer);
  const parts = Object.keys(zip.files).filter(
    (name) =>
      name === 'word/document.xml' ||
      /^word\/header\d+\.xml$/.test(name) ||
      /^word\/footer\d+\.xml$/.test(name),
  );

  const chunks: string[] = [];
  for (const part of parts.sort()) {
    const xml = await zip.file(part)?.async('string');
    if (!xml) continue;
    const runs = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
    chunks.push(runs.join(''));
  }

  return chunks.join('\n').replace(/\s+/g, ' ').trim();
}

function collapseWhitespace(text: string): string {
  return (text || '').replace(/\s+/g, ' ').trim();
}

function findFlexibleRange(
  haystack: string,
  needle: string,
): { start: number; end: number } | null {
  if (!needle) return null;

  const direct = haystack.indexOf(needle);
  if (direct >= 0) return { start: direct, end: direct + needle.length };

  const ned = collapseWhitespace(needle);
  if (!ned) return null;

  for (let start = 0; start < haystack.length; start++) {
    let h = start;
    let n = 0;
    while (n < ned.length && h < haystack.length) {
      if (/\s/.test(haystack[h])) {
        h++;
        continue;
      }
      if (/\s/.test(ned[n])) {
        n++;
        continue;
      }
      if (haystack[h] !== ned[n]) break;
      h++;
      n++;
    }
    while (n < ned.length && /\s/.test(ned[n])) n++;
    if (n >= ned.length) {
      return { start, end: h };
    }
  }

  return null;
}

function applyReplacementToConcat(
  concat: string,
  from: string,
  to: string,
): string | null {
  const range = findFlexibleRange(concat, from);
  if (!range) return null;
  return concat.slice(0, range.start) + to + concat.slice(range.end);
}

type WtRun = {
  full: string;
  attrs: string;
  text: string;
};

function extractWtRuns(xml: string): WtRun[] {
  const runs: WtRun[] = [];
  const regex = /<w:t(\s[^>]*)?>([^<]*)<\/w:t>/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(xml)) !== null) {
    runs.push({ full: match[0], attrs: match[1] || '', text: match[2] });
  }
  return runs;
}

function concatWtRuns(runs: WtRun[]): string {
  return runs.map((r) => r.text).join('');
}

function redistributeTextToWtRuns(xml: string, runs: WtRun[], newConcat: string): string {
  if (!runs.length) return xml;

  const slices: string[] = [];
  let pos = 0;
  for (let i = 0; i < runs.length; i++) {
    const capacity = runs[i].text.length;
    if (pos >= newConcat.length) {
      slices.push('');
      continue;
    }
    if (i === runs.length - 1) {
      slices.push(newConcat.slice(pos));
      pos = newConcat.length;
      continue;
    }
    const take = Math.min(capacity, newConcat.length - pos);
    slices.push(newConcat.slice(pos, pos + take));
    pos += take;
  }

  let runIdx = 0;
  return xml.replace(/<w:t(\s[^>]*)?>([^<]*)<\/w:t>/g, (full, attrs, text) => {
    const run = runs[runIdx];
    const slice = slices[runIdx] ?? '';
    runIdx++;
    if (slice === text) return full;
    return `<w:t${attrs || ''}>${escapeXmlText(slice)}</w:t>`;
  });
}
function applyReplacementsToXmlRunAware(
  xml: string,
  replacements: Array<{ from: string; to: string }>,
): string {
  const runs = extractWtRuns(xml);
  if (!runs.length) return xml;

  let concat = concatWtRuns(runs);
  let changed = false;

  for (const { from, to } of replacements) {
    if (!from) continue;
    const next = applyReplacementToConcat(concat, from, to);
    if (next === null || next === concat) continue;
    concat = next;
    changed = true;
  }

  if (!changed) return xml;
  return redistributeTextToWtRuns(xml, runs, concat);
}

function collectReplacementCandidates(text: string): string[] {
  const out = new Set<string>();
  for (const match of text.match(/[A-Za-z0-9][A-Za-z0-9\s.,@+|()':/\-&]{1,80}/g) || []) {
    out.add(match.trim());
  }
  return [...out].filter((s) => s.length >= 2).sort((a, b) => b.length - a.length);
}

function tryGlobalPhraseReplace(
  oldText: string,
  newText: string,
  phrase: string,
): { from: string; to: string } | null {
  if (phrase.length < 2 || !oldText.includes(phrase)) return null;

  const positions = new Set<number>();
  let idx = oldText.indexOf(phrase);
  while (idx >= 0) {
    positions.add(idx);
    idx = oldText.indexOf(phrase, idx + 1);
  }

  for (let extra = -25; extra <= 35; extra++) {
    const tLen = phrase.length + extra;
    if (tLen < 1) continue;

    for (const pos of positions) {
      for (const start of [pos, pos - 3, pos + 3, 0]) {
        if (start < 0 || start + tLen > newText.length) continue;
        const to = newText.slice(start, start + tLen);
        if (!to || phrase === to) continue;
        if (oldText.split(phrase).join(to) === newText) {
          return { from: phrase, to };
        }
      }
    }
  }

  return null;
}

function getTextReplacements(
  oldText: string,
  newText: string,
  phraseHints: string[] = [],
): Array<{ from: string; to: string }> {
  if (normalizeEditorText(oldText) === normalizeEditorText(newText)) return [];

  const phrases = [
    ...new Set(
      [...phraseHints, ...collectReplacementCandidates(oldText), ...collectReplacementCandidates(newText)].filter(
        (p) => p.length >= 2,
      ),
    ),
  ].sort((a, b) => b.length - a.length);

  for (const phrase of phrases) {
    if (oldText.includes(phrase) && !newText.includes(phrase)) {
      const candidate = oldText.split(phrase).join('');
      if (normalizeEditorText(candidate) === normalizeEditorText(newText)) {
        return [{ from: phrase, to: '' }];
      }
    }
  }

  for (const phrase of phrases) {
    const hit = tryGlobalPhraseReplace(oldText, newText, phrase);
    if (hit) return [hit];
  }

  const inline = findInlineDiffReplacement(oldText, newText);
  if (inline) return [inline];

  return [];
}

function findInlineDiffReplacement(
  oldText: string,
  newText: string,
): { from: string; to: string } | null {
  const oldNorm = normalizeEditorText(oldText);
  const newNorm = normalizeEditorText(newText);
  if (oldNorm === newNorm) return null;

  let start = 0;
  while (start < oldNorm.length && start < newNorm.length && oldNorm[start] === newNorm[start]) {
    start++;
  }

  let oldEnd = oldNorm.length;
  let newEnd = newNorm.length;
  while (oldEnd > start && newEnd > start && oldNorm[oldEnd - 1] === newNorm[newEnd - 1]) {
    oldEnd--;
    newEnd--;
  }

  const from = oldNorm.slice(start, oldEnd).trim();
  const to = newNorm.slice(start, newEnd).trim();
  if (!from && !to) return null;
  if (from === to) return null;
  return { from, to };
}

export function getAllTextReplacements(
  oldText: string,
  newText: string,
  phraseHints: string[] = [],
): Array<{ from: string; to: string }> {
  if (normalizeEditorText(oldText) === normalizeEditorText(newText)) return [];

  const seen = new Set<string>();
  const replacements: Array<{ from: string; to: string }> = [];
  let current = oldText;

  for (let pass = 0; pass < 40; pass++) {
    if (normalizeEditorText(current) === normalizeEditorText(newText)) break;

    const batch = getTextReplacements(current, newText, phraseHints);
    if (!batch.length) break;

    const { from, to } = batch[0];
    const key = `${from}→${to}`;
    if (seen.has(key)) break;
    seen.add(key);

    replacements.push({ from, to });
    const next = applyReplacementToConcat(current, from, to);
    current = next ?? current.split(from).join(to);
  }

  return replacements;
}

function extractDocxPhraseHints(docxBuffer: Buffer): Promise<string[]> {
  return JSZip.loadAsync(docxBuffer).then((zip) => {
    const file = zip.file('word/document.xml');
    if (!file) return [];
    return file.async('string').then((xml) => {
      const runs = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1].trim());
      return [...new Set(runs.filter((t) => t.length >= 4))].sort((a, b) => b.length - a.length);
    });
  });
}

function applyReplacementsToXml(
  xml: string,
  replacements: Array<{ from: string; to: string }>,
): string {
  return applyReplacementsToXmlRunAware(xml, replacements);
}

function isDocxXmlPart(name: string): boolean {
  return DOCX_XML_PARTS.some((p) =>
    typeof p === 'string' ? p === name : p.test(name),
  );
}

/**
 * Patch DOCX in-place: keeps layout/fonts/images, only updates changed text runs.
 * Falls back to original buffer when no text changes detected.
 */
export async function patchDocxPreservingFormat(
  originalDocxBuffer: Buffer,
  oldPlainText: string,
  newPlainText: string,
): Promise<{ buffer: Buffer; applied: boolean }> {
  const oldNorm = normalizeEditorText(oldPlainText);
  const newNorm = normalizeEditorText(newPlainText);

  if (oldNorm === newNorm) {
    return { buffer: originalDocxBuffer, applied: false };
  }

  const phraseHints = await extractDocxPhraseHints(originalDocxBuffer);
  const replacements = getAllTextReplacements(oldPlainText, newPlainText, phraseHints);
  if (!replacements.length) {
    return { buffer: originalDocxBuffer, applied: false };
  }

  const zip = await JSZip.loadAsync(originalDocxBuffer);

  for (const name of Object.keys(zip.files)) {
    if (!isDocxXmlPart(name) || zip.files[name].dir) continue;
    const xml = await zip.file(name)!.async('string');
    const patched = applyReplacementsToXml(xml, replacements);
    zip.file(name, patched);
  }

  const buffer = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  return { buffer, applied: true };
}

export function saveOriginalDocxToBundle(editableDocxPath: string, bundleDir: string): string {
  const dest = `${bundleDir}/original.docx`;
  fs.copyFileSync(editableDocxPath, dest);
  return dest;
}