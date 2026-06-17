import { PrismaService } from '../../prisma/prisma.service';
export declare class FilesService {
    private prisma;
    constructor(prisma: PrismaService);
    saveUploadedFile(userId: string, file: Express.Multer.File): Promise<{
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
    findUserFiles(userId: string): Promise<{
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
