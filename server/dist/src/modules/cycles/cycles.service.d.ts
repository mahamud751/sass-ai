import { PrismaService } from '../../prisma/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
export declare class CyclesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateCycleDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        startDate: Date;
        endDate: Date | null;
        familyMemberId: string | null;
        userId: string;
        cycleLength: number | null;
        flow: string | null;
        symptoms: string[];
    }>;
    findAll(userId: string, familyMemberId?: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        } | null;
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        startDate: Date;
        endDate: Date | null;
        familyMemberId: string | null;
        userId: string;
        cycleLength: number | null;
        flow: string | null;
        symptoms: string[];
    })[]>;
    predictNext(userId: string, familyMemberId: string): Promise<{
        message: string;
        lastPeriod?: undefined;
        predictedNext?: undefined;
        avgCycleLength?: undefined;
        basedOn?: undefined;
    } | {
        lastPeriod: Date;
        predictedNext: Date;
        avgCycleLength: number;
        basedOn: number;
        message?: undefined;
    }>;
    remove(userId: string, id: string): Promise<{
        success: boolean;
    }>;
}
