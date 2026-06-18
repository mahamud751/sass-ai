import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from '../family/family-access.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
export declare class HealthService {
    private prisma;
    private familyAccess;
    constructor(prisma: PrismaService, familyAccess: FamilyAccessService);
    create(userId: string, dto: CreateHealthRecordDto): Promise<{
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        doctorName: string | null;
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
        userId: string;
        familyMemberId: string | null;
        doctorName: string | null;
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
        userId: string;
        familyMemberId: string | null;
        doctorName: string | null;
        hospitalName: string | null;
        date: Date;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    })[]>;
}
