import { MedicineInstruction, ReminderFrequency } from '@prisma/client';
export declare class CreateMedicineDto {
    name: string;
    dosage: string;
    instruction?: MedicineInstruction;
    customInstruction?: string;
    startDate: string;
    endDate?: string;
    frequency?: ReminderFrequency;
    times?: string[];
    stockCount?: number;
    lowStockThreshold?: number;
    familyMemberId?: string;
    notes?: string;
}
