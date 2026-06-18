import { PrismaService } from '../../prisma/prisma.service';
import { CreateImmunizationDto } from './dto/create-immunization.dto';
export declare class ImmunizationsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateImmunizationDto): Promise<{
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
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    }>;
    findAll(userId: string, familyMemberId?: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    })[]>;
    getDue(userId: string): Promise<({
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
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    })[]>;
    markGiven(userId: string, id: string, body: {
        administeredDate?: string;
        notes?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string;
        administeredDate: Date | null;
        vaccineName: string;
        scheduledDate: Date;
        dose: number | null;
        batchNumber: string | null;
        location: string | null;
        documentId: string | null;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
    getStandardSchedule(birthDate: Date): {
        vaccineName: string;
        scheduled: Date;
        dose: number;
    }[];
}
