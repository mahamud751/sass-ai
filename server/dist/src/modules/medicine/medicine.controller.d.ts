import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { LogMedicineDto } from './dto/log-medicine.dto';
export declare class MedicineController {
    private readonly medicineService;
    constructor(medicineService: MedicineService);
    create(user: any, dto: CreateMedicineDto): Promise<{
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
            linkedUserId: string | null;
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
    }>;
    findAll(user: any, familyMemberId?: string): Promise<({
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
    })[]>;
    findToday(user: any): Promise<({
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
    })[]>;
    findOne(user: any, id: string): Promise<{
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
            linkedUserId: string | null;
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
    }>;
    log(user: any, id: string, dto: LogMedicineDto): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.MedicineLogStatus;
        scheduledTime: Date;
        takenAt: Date | null;
        medicineId: string;
    }>;
    getLogs(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        notes: string | null;
        status: import("@prisma/client").$Enums.MedicineLogStatus;
        scheduledTime: Date;
        takenAt: Date | null;
        medicineId: string;
    }[]>;
}
