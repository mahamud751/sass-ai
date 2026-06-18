import { RelationType, BloodGroup, Gender } from '@prisma/client';
export declare class CreateFamilyMemberDto {
    fullName: string;
    relation: RelationType;
    dateOfBirth?: string;
    bloodGroup?: BloodGroup;
    gender?: Gender;
    phone?: string;
    email?: string;
    address?: string;
    emergencyContact?: string;
    notes?: string;
    createLogin?: boolean;
    loginEmail?: string;
    password?: string;
}
