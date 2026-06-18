"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fixMojibake = fixMojibake;
exports.cleanPdfExtractedText = cleanPdfExtractedText;
exports.cleanHtmlExtracted = cleanHtmlExtracted;
exports.hasPdfGarbage = hasPdfGarbage;
exports.deduplicateRepeatedBlocks = deduplicateRepeatedBlocks;
const ICON_REPLACEMENTS = [
    [/Ø=ÜÍ\s*/g, '📍 '],
    [/Ø=ÜÞ\s*/g, '📞 '],
    [/Ø=Üç\s*/g, '✉️ '],
    [/Ø<ß\s*[\u0300-\u036f]?\s*/g, ''],
    [/Ø>Ýà\s*/g, '\n\n## '],
    [/Ø>Ýê\s*/g, '\n\n## '],
    [/Ø>Ýé\s*/g, '\n• '],
    [/Ø>Ýì\s*/g, '\n• '],
    [/Ø=ÜÁ\s*/g, '\n\n## '],
    [/Ø=Ü¼\s*/g, '\n\n## '],
    [/Ø=ÜÊ\s*/g, '\n• '],
    [/Ø=ÞÍþ\s*/g, '\n• '],
    [/Ø=ÝÂþ\s*/g, '\n• '],
    [/Ø[=<>][A-Za-z\u00C0-\u00FF\u0300-\u036f]{0,6}\s*/g, ''],
    [/[\u0080-\u009F]/g, ''],
    [/\uFFFD/g, ''],
    [/[\u0300-\u036f](?=\s)/g, ''],
];
function fixMojibake(text) {
    if (!text)
        return '';
    try {
        const recovered = Buffer.from(text, 'latin1').toString('utf8');
        const bad = (recovered.match(/\uFFFD/g) || []).length;
        const origBad = (text.match(/Ø[=<>]/g) || []).length;
        if (bad < origBad && recovered.length > 0)
            return recovered;
    }
    catch {
    }
    return text;
}
function cleanPdfExtractedText(text) {
    let out = fixMojibake(text || '');
    for (const [pattern, replacement] of ICON_REPLACEMENTS) {
        out = out.replace(pattern, replacement);
    }
    out = deduplicateRepeatedBlocks(out);
    return out
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/^\s+|\s+$/gm, (m) => m.trim())
        .trim();
}
function cleanHtmlExtracted(html) {
    let out = html || '';
    for (const [pattern, replacement] of ICON_REPLACEMENTS) {
        out = out.replace(pattern, replacement);
    }
    return out;
}
function hasPdfGarbage(text) {
    return /Ø[=<>]|Ø<ß|[\u0080-\u009F]/.test(text || '');
}
function deduplicateRepeatedBlocks(text) {
    const input = text || '';
    const lines = input.split('\n');
    if (lines.length < 3)
        return input;
    const half = Math.floor(lines.length / 2);
    const first = lines.slice(0, half).join('\n').trim();
    const second = lines.slice(half).join('\n').trim();
    if (first.length > 80 && first === second)
        return first;
    for (let size = Math.min(20, Math.floor(lines.length / 2)); size >= 3; size--) {
        for (let i = 0; i <= lines.length - size * 2; i++) {
            const block = lines.slice(i, i + size).join('\n').trim();
            if (block.length < 40)
                continue;
            const next = lines.slice(i + size, i + size * 2).join('\n').trim();
            if (block === next) {
                return [...lines.slice(0, i + size), ...lines.slice(i + size * 2)].join('\n');
            }
        }
    }
    const minDup = 60;
    for (let len = Math.min(400, Math.floor(input.length / 2)); len >= minDup; len -= 10) {
        const block = input.slice(0, len).trim();
        const idx = input.indexOf(block, 1);
        if (idx > 0 && idx < len + 40)
            return input.slice(0, idx).trimEnd() + input.slice(idx + block.length);
    }
    return input;
}
//# sourceMappingURL=text-cleanup.helper.js.map