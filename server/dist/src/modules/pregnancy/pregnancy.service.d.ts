import { PrismaService } from '../../prisma/prisma.service';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
export declare class PregnancyService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreatePregnancyDto): Promise<{
        familyMember: {
            fullName: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        status: string;
        dueDate: Date;
        lmpDate: Date | null;
        conceptionDate: Date | null;
    }>;
    findAll(userId: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
            relation: import("@prisma/client").$Enums.RelationType;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        status: string;
        dueDate: Date;
        lmpDate: Date | null;
        conceptionDate: Date | null;
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
            linkedUserId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        status: string;
        dueDate: Date;
        lmpDate: Date | null;
        conceptionDate: Date | null;
    }>;
    update(userId: string, id: string, dto: Partial<CreatePregnancyDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        status: string;
        dueDate: Date;
        lmpDate: Date | null;
        conceptionDate: Date | null;
    }>;
    remove(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        status: string;
        dueDate: Date;
        lmpDate: Date | null;
        conceptionDate: Date | null;
    }>;
    getCurrentWeek(dueDate: Date, lmpDate?: Date | null): number;
}
