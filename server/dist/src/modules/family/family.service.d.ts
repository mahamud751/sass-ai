import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from './family-access.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
export declare class FamilyService {
    private prisma;
    private familyAccess;
    constructor(prisma: PrismaService, familyAccess: FamilyAccessService);
    createFamily(userId: string, dto: CreateFamilyDto): Promise<{
        members: ({
            linkedUser: {
                email: string;
                fullName: string;
                id: string;
            } | null;
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
            linkedUserId: string | null;
        })[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
    }>;
    getFamilies(userId: string): Promise<({
        members: ({
            linkedUser: {
                email: string;
                fullName: string;
                id: string;
            } | null;
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
            linkedUserId: string | null;
        })[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
    })[]>;
    getFamilyById(userId: string, familyId: string): Promise<{
        members: ({
            linkedUser: {
                email: string;
                fullName: string;
                id: string;
            } | null;
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
            linkedUserId: string | null;
        })[];
    } & {
        description: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        ownerId: string;
    }>;
    addMember(userId: string, familyId: string, dto: CreateFamilyMemberDto): Promise<{
        linkedUser: {
            email: string;
            fullName: string;
            id: string;
        } | null;
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
        linkedUserId: string | null;
    }>;
    getMembers(userId: string, familyId: string): Promise<({
        linkedUser: {
            email: string;
            fullName: string;
            id: string;
        } | null;
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
        linkedUserId: string | null;
    })[]>;
    getMemberDetails(userId: string, memberId: string): Promise<{
        familyGroup: {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            ownerId: string;
        };
        linkedUser: {
            email: string;
            fullName: string;
            id: string;
        } | null;
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
        linkedUserId: string | null;
    }>;
}
