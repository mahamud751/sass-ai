import { StreamableFile } from '@nestjs/common';
import { FilesService } from './files.service';
import { ConvertFileDto } from './dto/convert-file.dto';
import { EditFileDto } from './dto/edit-file.dto';
import { EditFileHtmlDto } from './dto/edit-file-html.dto';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(user: any, file: Express.Multer.File): Promise<{
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
    uploadAndConvert(user: any, file: Express.Multer.File, targetFormat: 'pdf' | 'docx', mode?: 'exact' | 'rich' | 'text'): Promise<{
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
    getFiles(user: any): Promise<{
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
    saveFormatEditor(user: any, dto: EditFileHtmlDto): Promise<{
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
    convert(user: any, dto: ConvertFileDto): Promise<{
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
    edit(user: any, dto: EditFileDto): Promise<{
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
    downloadFile(user: any, id: string): Promise<StreamableFile>;
    extractHtml(user: any, id: string): Promise<{
        html: string;
    }>;
    extractText(user: any, id: string): Promise<import("./files.service").TextExtractionResult>;
    prepareForEdit(user: any, id: string): Promise<{
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
    openFormatEditor(user: any, id: string): Promise<{
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
}
