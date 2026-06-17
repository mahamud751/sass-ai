import { DocumentType } from '@prisma/client';
export declare class CreateDocumentDto {
    type: DocumentType;
    title: string;
    description?: string;
    fileId?: string;
    fileUrl?: string;
    tags?: string[];
    expiryDate?: string;
    secureNotes?: string;
    familyMemberId?: string;
}
