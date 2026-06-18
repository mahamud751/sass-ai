import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
export declare class DocumentsController {
    private readonly documentsService;
    constructor(documentsService: DocumentsService);
    create(user: any, dto: CreateDocumentDto): Promise<{
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        userId: string;
        familyMemberId: string | null;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    findAll(user: any, query: any): Promise<({
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
        userId: string;
        familyMemberId: string | null;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    })[]>;
    search(user: any, q: string): Promise<({
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
            linkedUserId: string | null;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        userId: string;
        familyMemberId: string | null;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    })[]>;
    findOne(user: any, id: string): Promise<{
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
            linkedUserId: string | null;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        userId: string;
        familyMemberId: string | null;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    update(user: any, id: string, dto: UpdateDocumentDto): Promise<{
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        userId: string;
        familyMemberId: string | null;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
    remove(user: any, id: string): Promise<{
        type: import("@prisma/client").$Enums.DocumentType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tags: string[];
        userId: string;
        familyMemberId: string | null;
        fileId: string | null;
        fileUrl: string | null;
        expiryDate: Date | null;
        secureNotes: string | null;
        isEncrypted: boolean;
    }>;
}
