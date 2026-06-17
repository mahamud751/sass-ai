import { MedicineLogStatus } from '@prisma/client';
export declare class LogMedicineDto {
    status: MedicineLogStatus;
    notes?: string;
}
