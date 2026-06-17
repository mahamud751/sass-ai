import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboard(user: any): Promise<{
        todayMedicines: number;
        medicinesList: ({
            familyMember: {
                fullName: string;
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
            userId: string;
        })[];
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
            familyMemberId: string | null;
            status: import("@prisma/client").$Enums.TaskStatus;
            userId: string;
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
            familyMemberId: string | null;
            userId: string;
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
            familyMemberId: string | null;
            userId: string;
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
        aiSuggestions: string[];
    }>;
}
