import { BillsService } from './bills.service';
export declare class BillsController {
    private readonly billsService;
    constructor(billsService: BillsService);
    create(user: any, dto: any): Promise<{
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
    findAll(user: any): Promise<{
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
    markPaid(user: any, id: string): Promise<{
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
