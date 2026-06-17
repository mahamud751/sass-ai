import { HealthService } from './health.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
export declare class HealthController {
    private readonly healthService;
    constructor(healthService: HealthService);
    create(user: any, dto: CreateHealthRecordDto): Promise<{
        type: import("@prisma/client").$Enums.HealthRecordType;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        familyMemberId: string | null;
        userId: string;
        date: Date;
        doctorName: string | null;
        hospitalName: string | null;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    }>;
    findAll(user: any, memberId?: string): Promise<({
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
        userId: string;
        date: Date;
        doctorName: string | null;
        hospitalName: string | null;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    })[]>;
    findByMember(user: any, memberId: string): Promise<({
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
        userId: string;
        date: Date;
        doctorName: string | null;
        hospitalName: string | null;
        diagnosis: string | null;
        aiSummary: string | null;
        fileIds: string[];
    })[]>;
}
