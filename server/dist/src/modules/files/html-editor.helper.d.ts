export type ParsedEditorHtml = {
    styles: string;
    body: string;
    bodyAttrs: string;
    title: string;
};
export type EditorBundleMeta = {
    sourceFileId: string;
    editableFileId: string;
    htmlFileName: string;
    sourcePlainText?: string;
    editorPlainText?: string;
};
export declare function parseLibreOfficeHtml(html: string): ParsedEditorHtml;
export declare function buildLibreOfficeHtml(styles: string, body: string, title?: string, bodyAttrs?: string): string;
export declare function sanitizeLibreOfficeHtmlForBrowser(html: string, bundleBaseUrl?: string): string;
export declare function injectEditorChrome(html: string): string;
export declare function stripEditorArtifacts(html: string): string;
export declare function sanitizeEditorHtml(body: string): string;
export declare function rewriteEditorAssetUrls(html: string, bundleId: string, mode: 'absolute' | 'relative'): string;
