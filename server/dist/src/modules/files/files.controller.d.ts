import { StreamableFile } from '@nestjs/common';
import { FilesService } from './files.service';
import { ConvertFileDto } from './dto/convert-file.dto';
import { EditFileDto } from './dto/edit-file.dto';
import { EditFileHtmlDto } from './dto/edit-file-html.dto';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(user: any, file: Express.Multer.File): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        userId: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
    }>;
    uploadAndConvert(user: any, file: Express.Multer.File, targetFormat: 'pdf' | 'docx', mode?: 'exact' | 'rich' | 'text'): Promise<{
        source: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
        };
        converted: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
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
        path: string;
        id: string;
        createdAt: Date;
        userId: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
    }[]>;
    saveFormatEditor(user: any, dto: EditFileHtmlDto): Promise<{
        docx: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
        };
        pdf: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
        } | null;
        editsApplied: boolean;
        message: string;
    }>;
    convert(user: any, dto: ConvertFileDto): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        userId: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
    }>;
    edit(user: any, dto: EditFileDto): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        userId: string;
        url: string | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
    }>;
    downloadFile(user: any, id: string): Promise<StreamableFile>;
    extractHtml(user: any, id: string): Promise<{
        html: string;
    }>;
    extractText(user: any, id: string): Promise<import("./files.service").TextExtractionResult>;
    prepareForEdit(user: any, id: string): Promise<{
        sourceFile: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
        };
        editableFile: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
        };
        text: string;
        hasGarbage: boolean;
        method: "libreoffice" | "pdf-parse" | "mammoth" | "plain";
        message: string;
    }>;
    openFormatEditor(user: any, id: string): Promise<{
        sourceFile: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
        };
        editableFile: {
            path: string;
            id: string;
            createdAt: Date;
            userId: string;
            url: string | null;
            metadata: import("@prisma/client/runtime/library").JsonValue | null;
            originalName: string;
            filename: string;
            mimetype: string;
            size: number;
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
