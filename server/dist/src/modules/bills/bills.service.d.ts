import { PrismaService } from '../../prisma/prisma.service';
export declare class BillsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: any): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        frequency: string;
        userId: string;
        dueDate: Date;
        isRecurring: boolean;
        reminderDays: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        category: string;
        isPaid: boolean;
        lastPaidDate: Date | null;
    }>;
    findAll(userId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        frequency: string;
        userId: string;
        dueDate: Date;
        isRecurring: boolean;
        reminderDays: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        category: string;
        isPaid: boolean;
        lastPaidDate: Date | null;
    }[]>;
    markPaid(userId: string, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        frequency: string;
        userId: string;
        dueDate: Date;
        isRecurring: boolean;
        reminderDays: number;
        amount: import("@prisma/client/runtime/library").Decimal;
        currency: string;
        category: string;
        isPaid: boolean;
        lastPaidDate: Date | null;
    }>;
}
