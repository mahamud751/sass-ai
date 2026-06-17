import { HealthRecordType } from '@prisma/client';
export declare class CreateHealthRecordDto {
    type: HealthRecordType;
    title: string;
    doctorName?: string;
    hospitalName?: string;
    date: string;
    diagnosis?: string;
    notes?: string;
    familyMemberId?: string;
}
