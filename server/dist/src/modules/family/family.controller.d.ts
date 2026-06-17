import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
export declare class FamilyController {
    private readonly familyService;
    constructor(familyService: FamilyService);
    createFamily(user: any, dto: CreateFamilyDto): Promise<{
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
    getFamilies(user: any): Promise<({
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
    getFamily(user: any, id: string): Promise<{
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
    addMember(user: any, familyId: string, dto: CreateFamilyMemberDto): Promise<{
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
    getMembers(user: any, familyId: string): Promise<{
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
    getMember(user: any, memberId: string): Promise<{
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
