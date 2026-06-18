import { MedicineInstruction, ReminderFrequency } from '@prisma/client';
export declare class PrescriptionItemDto {
    medicineName: string;
    dosage: string;
    frequency?: ReminderFrequency;
    times?: string[];
    instruction?: MedicineInstruction;
    durationDays?: number;
    notes?: string;
}
export declare class CreatePrescriptionDto {
    familyMemberId?: string;
    doctorName?: string;
    hospitalName?: string;
    date: string;
    notes?: string;
    healthRecordId?: string;
    fileId?: string;
    items: PrescriptionItemDto[];
}
