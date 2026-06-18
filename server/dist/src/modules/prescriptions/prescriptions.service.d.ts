import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
export declare class PrescriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    private verifyFamilyMember;
    create(userId: string, dto: CreatePrescriptionDto): Promise<{
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
        familyMemberId: string | null;
        doctorName: string | null;
        userId: string;
        hospitalName: string | null;
        date: Date;
        healthRecordId: string | null;
        fileId: string | null;
    }>;
    findAll(userId: string, familyMemberId?: string): Promise<({
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
        familyMemberId: string | null;
        doctorName: string | null;
        userId: string;
        hospitalName: string | null;
        date: Date;
        healthRecordId: string | null;
        fileId: string | null;
    })[]>;
    findOne(userId: string, id: string): Promise<{
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
        familyMemberId: string | null;
        doctorName: string | null;
        userId: string;
        hospitalName: string | null;
        date: Date;
        healthRecordId: string | null;
        fileId: string | null;
    }>;
    autoAddMedicines(userId: string, prescriptionId: string): Promise<{
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
            userId: string;
        }) | null)[];
    }>;
    addMedicineFromItem(userId: string, prescriptionId: string, itemId: string): Promise<({
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
        userId: string;
    }) | null>;
    private createMedicineFromItem;
    private includeRelations;
}
