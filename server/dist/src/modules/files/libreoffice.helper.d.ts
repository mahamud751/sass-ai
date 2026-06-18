export declare function findLibreOfficeBinary(): string | null;
export declare function isLibreOfficeAvailable(): boolean;
export declare function convertDocumentExact(inputPath: string, originalName: string, targetFormat: 'pdf' | 'docx'): Promise<Buffer>;
export declare function decodeUploadFilename(name: string): string;
export declare function exportDocxToHtmlBundle(docxPath: string, bundleDir: string): Promise<{
    htmlPath: string;
    html: string;
    htmlFileName: string;
}>;
export declare function importHtmlFileToDocx(htmlPath: string): Promise<Buffer>;
export declare function exportDocxFileToPdf(docxPath: string): Promise<Buffer>;
