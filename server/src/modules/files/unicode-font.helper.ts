import * as fs from 'fs';

const UNICODE_FONT_CANDIDATES = [
  process.env.UNICODE_FONT_PATH,
  '/System/Library/Fonts/Supplemental/Arial Unicode.ttf',
  '/Library/Fonts/Arial Unicode.ttf',
  '/System/Library/Fonts/Supplemental/Arial.ttf',
  '/usr/share/fonts/truetype/noto/NotoSans-Regular.ttf',
  '/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc',
  'C:\\Windows\\Fonts\\arialuni.ttf',
  'C:\\Windows\\Fonts\\arial.ttf',
].filter(Boolean) as string[];

export function findUnicodeFont(): string | null {
  for (const fontPath of UNICODE_FONT_CANDIDATES) {
    if (fs.existsSync(fontPath)) return fontPath;
  }
  return null;
}