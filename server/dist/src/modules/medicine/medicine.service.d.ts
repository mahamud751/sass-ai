import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { LogMedicineDto } from './dto/log-medicine.dto';
export declare class MedicineService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateMedicineDto): Promise<{
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
        } | null;
        scheduleTimes: {
            id: string;
            createdAt: Date;
            medicineId: string;
            time: string;
        }[];
        logs: {
            id: string;
            createdAt: Date;
            notes: string | null;
            status: import("@prisma/client").$Enums.MedicineLogStatus;
            scheduledTime: Date;
            takenAt: Date | null;
            medicineId: string;
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
    }>;
    findAll(userId: string, query?: {
        familyMemberId?: string;
    }): Promise<({
        familyMember: {
            fullName: string;
            id: string;
            relation: import("@prisma/client").$Enums.RelationType;
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
    })[]>;
    findToday(userId: string): Promise<({
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
        logs: {
            id: string;
            createdAt: Date;
            notes: string | null;
            status: import("@prisma/client").$Enums.MedicineLogStatus;
            scheduledTime: Date;
            takenAt: Date | null;
            medicineId: string;
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
    })[]>;
    findOne(userId: string, id: string): Promise<{
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
        } | null;
        scheduleTimes: {
            id: string;
            createdAt: Date;
            medicineId: string;
            time: string;
        }[];
        logs: {
            id: string;
            createdAt: Date;
            notes: string | null;
            status: import("@prisma/client").$Enums.MedicineLogStatus;
            scheduledTime: Date;
            takenAt: Date | null;
            medicineId: string;
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
    }>;
    log(userId: string, medicineId: string, dto: LogMedicineDto): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.MedicineLogStatus;
        scheduledTime: Date;
        takenAt: Date | null;
        medicineId: string;
    }>;
    getLogs(userId: string, medicineId: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.MedicineLogStatus;
        scheduledTime: Date;
        takenAt: Date | null;
        medicineId: string;
    }[]>;
}
