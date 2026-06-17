import { FinanceTransactionType } from '@prisma/client';
export declare class CreateTransactionDto {
    type: FinanceTransactionType;
    amount: number;
    currency?: string;
    category: string;
    description: string;
    date: string;
    familyMemberId?: string;
    notes?: string;
}
