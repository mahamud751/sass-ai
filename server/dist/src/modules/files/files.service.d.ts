import { PrismaService } from '../../prisma/prisma.service';
import * as fs from 'fs';
export type ConvertMode = 'exact' | 'rich' | 'text';
export type TextExtractionResult = {
    text: string;
    hasGarbage: boolean;
    method: 'libreoffice' | 'pdf-parse' | 'mammoth' | 'plain';
};
export declare class FilesService {
    private prisma;
    constructor(prisma: PrismaService);
    private getUploadDir;
    private isConvertibleName;
    getConverterCapabilities(): Promise<{
        libreOfficeInstalled: boolean;
        pdf2docxAvailable: boolean;
        exactFormatAvailable: boolean;
        unicodeFontAvailable: boolean;
        modes: {
            id: string;
            label: string;
            description: string;
            available: boolean;
        }[];
        installHint: string | null;
    }>;
    validateConvertibleUpload(file: Express.Multer.File): void;
    saveUploadedFile(userId: string, file: Express.Multer.File): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        path: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string;
    }>;
    uploadAndConvert(userId: string, file: Express.Multer.File, targetFormat: 'pdf' | 'docx', mode?: ConvertMode): Promise<{
        source: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
        converted: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
    }>;
    findUserFiles(userId: string): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        path: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string;
    }[]>;
    findUserFile(userId: string, fileId: string): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        path: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string;
    }>;
    getFileDownload(userId: string, fileId: string): Promise<{
        stream: fs.ReadStream;
        filename: string;
        mimetype: string;
        size: number;
    }>;
    extractText(userId: string, fileId: string): Promise<TextExtractionResult>;
    extractHtml(userId: string, fileId: string): Promise<string>;
    private getEditorBundleDir;
    private createEditorBundleId;
    openFormatEditor(userId: string, fileId: string): Promise<{
        sourceFile: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
        editableFile: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
        editBundleId: string;
        htmlPath: string;
        htmlFileName: string;
        editorUrl: string;
        docxUrl: string;
        styles: string;
        body: string;
        title: string;
        formatPreserved: boolean;
        message: string;
    }>;
    saveFormatEditor(userId: string, fileId: string, html: string, editBundleId: string, exportPdf?: boolean, clientBaselinePlain?: string, clientEditedPlain?: string): Promise<{
        docx: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
        pdf: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        } | null;
        editsApplied: boolean;
        message: string;
    }>;
    prepareForEdit(userId: string, fileId: string): Promise<{
        sourceFile: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
        editableFile: {
            id: string;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
            path: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            userId: string;
        };
        text: string;
        hasGarbage: boolean;
        method: "libreoffice" | "pdf-parse" | "mammoth" | "plain";
        message: string;
    }>;
    convertFile(userId: string, fileId: string, targetFormat: 'pdf' | 'docx', mode?: ConvertMode): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        path: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string;
    }>;
    private convertPdfForEditor;
    private convertExactFormat;
    private convertRichFormat;
    private convertTextOnly;
    editFileContent(userId: string, fileId: string, content: string): Promise<{
        id: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        path: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        userId: string;
    }>;
    private extractPdfText;
    private extractPdfTextViaLibreOffice;
    private extractPdfHtmlViaLibreOffice;
    private parsePdfTextRaw;
    private createDocxFromHtml;
    private createDocxFromText;
    private createPdfFromText;
    private saveTextFile;
    private saveConvertedFile;
}
