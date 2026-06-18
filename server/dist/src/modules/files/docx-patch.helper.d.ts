export declare function normalizeEditorText(text: string): string;
export declare function plainTextFromEditorHtml(html: string): string;
export declare function extractPlainTextFromHtml(html: string): string;
export declare function extractPlainTextFromDocx(docxBuffer: Buffer): Promise<string>;
export declare function getAllTextReplacements(oldText: string, newText: string, phraseHints?: string[]): Array<{
    from: string;
    to: string;
}>;
export declare function patchDocxPreservingFormat(originalDocxBuffer: Buffer, oldPlainText: string, newPlainText: string): Promise<{
    buffer: Buffer;
    applied: boolean;
}>;
export declare function saveOriginalDocxToBundle(editableDocxPath: string, bundleDir: string): string;
