import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from '../family/family-access.service';
export declare class DashboardService {
    private prisma;
    private familyAccess;
    constructor(prisma: PrismaService, familyAccess: FamilyAccessService);
    private memberVisibilityWhere;
    getEmergencyOverview(userId: string): Promise<{
        members: {
            id: string;
            fullName: string;
            relation: import("@prisma/client").$Enums.RelationType;
            bloodGroup: "A_POSITIVE" | "A_NEGATIVE" | "B_POSITIVE" | "B_NEGATIVE" | "AB_POSITIVE" | "AB_NEGATIVE" | "O_POSITIVE" | "O_NEGATIVE" | null;
            phone: string | null;
            emergencyContact: string | null;
        }[];
        allergies: {
            title: string;
            notes: string | null;
            for: string;
        }[];
        currentMedicines: {
            name: string;
            dosage: string;
            for: string;
            doctor: string | null;
        }[];
        emergencyContacts: {
            email: string | null;
            phone: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            relation: string;
            address: string | null;
            notes: string | null;
            userId: string;
            familyMemberId: string | null;
            isPrimary: boolean;
        }[];
        recentDoctors: {
            name: string | null;
            hospital: string | null;
            for: string | undefined;
        }[];
    }>;
    getDashboard(userId: string): Promise<{
        todayMedicines: number;
        todayDoseCount: number;
        pendingDoseCount: number;
        medicinesList: ({
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
        })[];
        todayDoses: {
            medicineId: string;
            name: string;
            dosage: string;
            time: string;
            familyMember: {
                fullName: string;
                id: string;
            } | null;
            doctorName: string | null;
            status: string;
        }[];
        pendingTasks: number;
        tasksList: ({
            familyMember: {
                fullName: string;
            } | null;
        } & {
            description: string | null;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            familyMemberId: string | null;
            status: import("@prisma/client").$Enums.TaskStatus;
            priority: import("@prisma/client").$Enums.TaskPriority;
            dueDate: Date | null;
            isRecurring: boolean;
            recurrenceRule: string | null;
            completedAt: Date | null;
        })[];
        monthlySummary: {
            income: number;
            expense: number;
            net: number;
            currency: string;
        };
        upcomingImportantDates: {
            type: string;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            userId: string;
            familyMemberId: string | null;
            date: Date;
            recurring: boolean;
            reminderDays: number;
        }[];
        recentDocuments: ({
            familyMember: {
                fullName: string;
            } | null;
        } & {
            type: import("@prisma/client").$Enums.DocumentType;
            description: string | null;
            title: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            tags: string[];
            userId: string;
            familyMemberId: string | null;
            fileId: string | null;
            fileUrl: string | null;
            expiryDate: Date | null;
            secureNotes: string | null;
            isEncrypted: boolean;
        })[];
        familyGroups: ({
            members: {
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
            }[];
        } & {
            description: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            ownerId: string;
        })[];
        expiringDocumentsCount: number;
        dueVaccinesCount: number;
        unreadNotifications: number;
        aiSuggestions: string[];
        isLinkedMember: boolean;
    }>;
    private getFamiliesForUser;
}
