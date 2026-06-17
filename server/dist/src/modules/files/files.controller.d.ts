import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    uploadFile(user: any, file: Express.Multer.File): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        userId: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        url: string | null;
    }>;
    getFiles(user: any): Promise<{
        path: string;
        id: string;
        createdAt: Date;
        userId: string;
        originalName: string;
        filename: string;
        mimetype: string;
        size: number;
        url: string | null;
    }[]>;
}
