import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
export declare class FinanceService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTransactionDto): Promise<{
        type: import("@prisma/client").$Enums.FinanceTransactionType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        date: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        category: string;
        relatedBillId: string | null;
    }>;
    findAll(userId: string): Promise<({
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
        } | null;
    } & {
        type: import("@prisma/client").$Enums.FinanceTransactionType;
        description: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        date: Date;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        category: string;
        relatedBillId: string | null;
    })[]>;
    getMonthlySummary(userId: string, year?: number, month?: number): Promise<{
        year: number;
        month: number;
        income: number;
        expense: number;
        net: number;
        currency: string;
    }>;
}
