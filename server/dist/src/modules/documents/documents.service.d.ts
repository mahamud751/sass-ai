import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateDocumentDto): Promise<{
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        familyMemberId: string | null;
        userId: string;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    findAll(userId: string, query?: any): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        familyMemberId: string | null;
        userId: string;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    })[]>;
    findOne(userId: string, id: string): Promise<{
        familyMember: {
            emergencyContact: string | null;
            email: string | null;
            fullName: string;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            relation: import("@prisma/client").$Enums.RelationType;
            gender: import("@prisma/client").$Enums.Gender;
            dateOfBirth: Date | null;
            bloodGroup: import("@prisma/client").$Enums.BloodGroup;
            address: string | null;
            notes: string | null;
            familyGroupId: string;
            ownerUserId: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        familyMemberId: string | null;
        userId: string;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    update(userId: string, id: string, dto: UpdateDocumentDto): Promise<{
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        familyMemberId: string | null;
        userId: string;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    remove(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        familyMemberId: string | null;
        userId: string;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    search(userId: string, query: string): Promise<({
        familyMember: {
            emergencyContact: string | null;
            email: string | null;
            fullName: string;
            phone: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            relation: import("@prisma/client").$Enums.RelationType;
            gender: import("@prisma/client").$Enums.Gender;
            dateOfBirth: Date | null;
            bloodGroup: import("@prisma/client").$Enums.BloodGroup;
            address: string | null;
            notes: string | null;
            familyGroupId: string;
            ownerUserId: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        familyMemberId: string | null;
        userId: string;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    })[]>;
}
