import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
export declare class PrescriptionsController {
    private readonly prescriptionsService;
    constructor(prescriptionsService: PrescriptionsService);
    create(user: any, dto: CreatePrescriptionDto): Promise<{
        familyMember: {
            fullName: string;
            id: string;
            relation: import("@prisma/client").$Enums.RelationType;
        } | null;
        items: ({
            medicine: {
                id: string;
                isActive: boolean;
                name: string;
                dosage: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            dosage: string;
            instruction: import("@prisma/client").$Enums.MedicineInstruction;
            frequency: import("@prisma/client").$Enums.ReminderFrequency;
            times: string[];
            medicineId: string | null;
            medicineName: string;
            durationDays: number | null;
            prescriptionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        doctorName: string | null;
        hospitalName: string | null;
        date: Date;
        healthRecordId: string | null;
        fileId: string | null;
    }>;
    findAll(user: any, familyMemberId?: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
            relation: import("@prisma/client").$Enums.RelationType;
        } | null;
        items: ({
            medicine: {
                id: string;
                isActive: boolean;
                name: string;
                dosage: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            dosage: string;
            instruction: import("@prisma/client").$Enums.MedicineInstruction;
            frequency: import("@prisma/client").$Enums.ReminderFrequency;
            times: string[];
            medicineId: string | null;
            medicineName: string;
            durationDays: number | null;
            prescriptionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        doctorName: string | null;
        hospitalName: string | null;
        date: Date;
        healthRecordId: string | null;
        fileId: string | null;
    })[]>;
    findOne(user: any, id: string): Promise<{
        familyMember: {
            fullName: string;
            id: string;
            relation: import("@prisma/client").$Enums.RelationType;
        } | null;
        items: ({
            medicine: {
                id: string;
                isActive: boolean;
                name: string;
                dosage: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            notes: string | null;
            dosage: string;
            instruction: import("@prisma/client").$Enums.MedicineInstruction;
            frequency: import("@prisma/client").$Enums.ReminderFrequency;
            times: string[];
            medicineId: string | null;
            medicineName: string;
            durationDays: number | null;
            prescriptionId: string;
        })[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        doctorName: string | null;
        hospitalName: string | null;
        date: Date;
        healthRecordId: string | null;
        fileId: string | null;
    }>;
    autoAddMedicines(user: any, id: string): Promise<{
        prescriptionId: string;
        addedCount: number;
        medicines: (({
            familyMember: {
                fullName: string;
                id: string;
            } | null;
            scheduleTimes: {
                id: string;
                createdAt: Date;
                medicineId: string;
                time: string;
            }[];
        } & {
            id: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            notes: string | null;
            userId: string;
            dosage: string;
            instruction: import("@prisma/client").$Enums.MedicineInstruction;
            customInstruction: string | null;
            startDate: Date;
            endDate: Date | null;
            frequency: import("@prisma/client").$Enums.ReminderFrequency;
            stockCount: number | null;
            lowStockThreshold: number | null;
            familyMemberId: string | null;
            doctorName: string | null;
        }) | null)[];
    }>;
    addMedicineFromItem(user: any, id: string, itemId: string): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        } | null;
        scheduleTimes: {
            id: string;
            createdAt: Date;
            medicineId: string;
            time: string;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        name: string;
        notes: string | null;
        userId: string;
        dosage: string;
        instruction: import("@prisma/client").$Enums.MedicineInstruction;
        customInstruction: string | null;
        startDate: Date;
        endDate: Date | null;
        frequency: import("@prisma/client").$Enums.ReminderFrequency;
        stockCount: number | null;
        lowStockThreshold: number | null;
        familyMemberId: string | null;
        doctorName: string | null;
    }) | null>;
}
