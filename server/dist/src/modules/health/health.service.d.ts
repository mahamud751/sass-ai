import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
export declare class HealthService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateHealthRecordDto): Promise<{
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        familyMemberId: string | null;
        doctorName: string | null;
        userId: string;
        hospitalName: string | null;
        date: Date;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    }>;
    findAll(userId: string, memberId?: string): Promise<({
        familyMember: {
            fullName: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        familyMemberId: string | null;
        doctorName: string | null;
        userId: string;
        hospitalName: string | null;
        date: Date;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    })[]>;
    findByMember(userId: string, memberId: string): Promise<({
        familyMember: {
            fullName: string;
        } | null;
    } & {
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        familyMemberId: string | null;
        doctorName: string | null;
        userId: string;
        hospitalName: string | null;
        date: Date;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    })[]>;
}
