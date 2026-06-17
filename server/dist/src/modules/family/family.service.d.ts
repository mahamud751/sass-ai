import { PrismaService } from '../../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
export declare class FamilyService {
    private prisma;
    constructor(prisma: PrismaService);
    createFamily(userId: string, dto: CreateFamilyDto): Promise<{
        members: {
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
        }[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
    }>;
    getFamilies(userId: string): Promise<({
        members: {
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
        }[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
    })[]>;
    getFamilyById(userId: string, familyId: string): Promise<{
        members: {
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
        }[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
    }>;
    addMember(userId: string, familyId: string, dto: CreateFamilyMemberDto): Promise<{
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
    }>;
    getMembers(userId: string, familyId: string): Promise<{
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
    }[]>;
    getMemberDetails(userId: string, memberId: string): Promise<{
        familyGroup: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            ownerId: string;
        };
    } & {
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
    }>;
}
