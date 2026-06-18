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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeEditorText = normalizeEditorText;
exports.plainTextFromEditorHtml = plainTextFromEditorHtml;
exports.extractPlainTextFromHtml = extractPlainTextFromHtml;
exports.extractPlainTextFromDocx = extractPlainTextFromDocx;
exports.getAllTextReplacements = getAllTextReplacements;
exports.patchDocxPreservingFormat = patchDocxPreservingFormat;
exports.saveOriginalDocxToBundle = saveOriginalDocxToBundle;
const fs = __importStar(require("fs"));
const jszip_1 = __importDefault(require("jszip"));
const html_editor_helper_1 = require("./html-editor.helper");
const DOCX_XML_PARTS = [
    'word/document.xml',
    /^word\/header\d+\.xml$/,
    /^word\/footer\d+\.xml$/,
];
function escapeXmlText(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
function escapeRegex(text) {
    return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function normalizeEditorText(text) {
    return (text || '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}
function plainTextFromEditorHtml(html) {
    const cleaned = (0, html_editor_helper_1.stripEditorArtifacts)(html);
    const parsed = (0, html_editor_helper_1.parseLibreOfficeHtml)(cleaned);
    return normalizeEditorText(extractPlainTextFromHtml((0, html_editor_helper_1.buildLibreOfficeHtml)(parsed.styles, (0, html_editor_helper_1.sanitizeEditorHtml)(parsed.body || cleaned), parsed.title, parsed.bodyAttrs)));
}
function extractPlainTextFromHtml(html) {
    let body = html || '';
    const bodyMatch = body.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch)
        body = bodyMatch[1];
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
async function extractPlainTextFromDocx(docxBuffer) {
    const zip = await jszip_1.default.loadAsync(docxBuffer);
    const parts = Object.keys(zip.files).filter((name) => name === 'word/document.xml' ||
        /^word\/header\d+\.xml$/.test(name) ||
        /^word\/footer\d+\.xml$/.test(name));
    const chunks = [];
    for (const part of parts.sort()) {
        const xml = await zip.file(part)?.async('string');
        if (!xml)
            continue;
        const runs = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1]);
        chunks.push(runs.join(''));
    }
    return chunks.join('\n').replace(/\s+/g, ' ').trim();
}
function collapseWhitespace(text) {
    return (text || '').replace(/\s+/g, ' ').trim();
}
function findFlexibleRange(haystack, needle) {
    if (!needle)
        return null;
    const direct = haystack.indexOf(needle);
    if (direct >= 0)
        return { start: direct, end: direct + needle.length };
    const ned = collapseWhitespace(needle);
    if (!ned)
        return null;
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
            if (haystack[h] !== ned[n])
                break;
            h++;
            n++;
        }
        while (n < ned.length && /\s/.test(ned[n]))
            n++;
        if (n >= ned.length) {
            return { start, end: h };
        }
    }
    return null;
}
function applyReplacementToConcat(concat, from, to) {
    const range = findFlexibleRange(concat, from);
    if (!range)
        return null;
    return concat.slice(0, range.start) + to + concat.slice(range.end);
}
function extractWtRuns(xml) {
    const runs = [];
    const regex = /<w:t(\s[^>]*)?>([^<]*)<\/w:t>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
        runs.push({ full: match[0], attrs: match[1] || '', text: match[2] });
    }
    return runs;
}
function concatWtRuns(runs) {
    return runs.map((r) => r.text).join('');
}
function redistributeTextToWtRuns(xml, runs, newConcat) {
    if (!runs.length)
        return xml;
    const slices = [];
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
        if (slice === text)
            return full;
        return `<w:t${attrs || ''}>${escapeXmlText(slice)}</w:t>`;
    });
}
function applyReplacementsToXmlRunAware(xml, replacements) {
    const runs = extractWtRuns(xml);
    if (!runs.length)
        return xml;
    let concat = concatWtRuns(runs);
    let changed = false;
    for (const { from, to } of replacements) {
        if (!from)
            continue;
        const next = applyReplacementToConcat(concat, from, to);
        if (next === null || next === concat)
            continue;
        concat = next;
        changed = true;
    }
    if (!changed)
        return xml;
    return redistributeTextToWtRuns(xml, runs, concat);
}
function collectReplacementCandidates(text) {
    const out = new Set();
    for (const match of text.match(/[A-Za-z0-9][A-Za-z0-9\s.,@+|()':/\-&]{1,80}/g) || []) {
        out.add(match.trim());
    }
    return [...out].filter((s) => s.length >= 2).sort((a, b) => b.length - a.length);
}
function tryGlobalPhraseReplace(oldText, newText, phrase) {
    if (phrase.length < 2 || !oldText.includes(phrase))
        return null;
    const positions = new Set();
    let idx = oldText.indexOf(phrase);
    while (idx >= 0) {
        positions.add(idx);
        idx = oldText.indexOf(phrase, idx + 1);
    }
    for (let extra = -25; extra <= 35; extra++) {
        const tLen = phrase.length + extra;
        if (tLen < 1)
            continue;
        for (const pos of positions) {
            for (const start of [pos, pos - 3, pos + 3, 0]) {
                if (start < 0 || start + tLen > newText.length)
                    continue;
                const to = newText.slice(start, start + tLen);
                if (!to || phrase === to)
                    continue;
                if (oldText.split(phrase).join(to) === newText) {
                    return { from: phrase, to };
                }
            }
        }
    }
    return null;
}
function getTextReplacements(oldText, newText, phraseHints = []) {
    if (normalizeEditorText(oldText) === normalizeEditorText(newText))
        return [];
    const phrases = [
        ...new Set([...phraseHints, ...collectReplacementCandidates(oldText), ...collectReplacementCandidates(newText)].filter((p) => p.length >= 2)),
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
        if (hit)
            return [hit];
    }
    const inline = findInlineDiffReplacement(oldText, newText);
    if (inline)
        return [inline];
    return [];
}
function findInlineDiffReplacement(oldText, newText) {
    const oldNorm = normalizeEditorText(oldText);
    const newNorm = normalizeEditorText(newText);
    if (oldNorm === newNorm)
        return null;
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
    if (!from && !to)
        return null;
    if (from === to)
        return null;
    return { from, to };
}
function getAllTextReplacements(oldText, newText, phraseHints = []) {
    if (normalizeEditorText(oldText) === normalizeEditorText(newText))
        return [];
    const seen = new Set();
    const replacements = [];
    let current = oldText;
    for (let pass = 0; pass < 40; pass++) {
        if (normalizeEditorText(current) === normalizeEditorText(newText))
            break;
        const batch = getTextReplacements(current, newText, phraseHints);
        if (!batch.length)
            break;
        const { from, to } = batch[0];
        const key = `${from}→${to}`;
        if (seen.has(key))
            break;
        seen.add(key);
        replacements.push({ from, to });
        const next = applyReplacementToConcat(current, from, to);
        current = next ?? current.split(from).join(to);
    }
    return replacements;
}
function extractDocxPhraseHints(docxBuffer) {
    return jszip_1.default.loadAsync(docxBuffer).then((zip) => {
        const file = zip.file('word/document.xml');
        if (!file)
            return [];
        return file.async('string').then((xml) => {
            const runs = [...xml.matchAll(/<w:t[^>]*>([^<]*)<\/w:t>/g)].map((m) => m[1].trim());
            return [...new Set(runs.filter((t) => t.length >= 4))].sort((a, b) => b.length - a.length);
        });
    });
}
function applyReplacementsToXml(xml, replacements) {
    return applyReplacementsToXmlRunAware(xml, replacements);
}
function isDocxXmlPart(name) {
    return DOCX_XML_PARTS.some((p) => typeof p === 'string' ? p === name : p.test(name));
}
async function patchDocxPreservingFormat(originalDocxBuffer, oldPlainText, newPlainText) {
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
    const zip = await jszip_1.default.loadAsync(originalDocxBuffer);
    for (const name of Object.keys(zip.files)) {
        if (!isDocxXmlPart(name) || zip.files[name].dir)
            continue;
        const xml = await zip.file(name).async('string');
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
function saveOriginalDocxToBundle(editableDocxPath, bundleDir) {
    const dest = `${bundleDir}/original.docx`;
    fs.copyFileSync(editableDocxPath, dest);
    return dest;
}
//# sourceMappingURL=docx-patch.helper.js.map