import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from '../family/family-access.service';
import { NotificationType, Prisma } from '@prisma/client';
export declare class NotificationsService {
    private prisma;
    private familyAccess;
    private readonly logger;
    constructor(prisma: PrismaService, familyAccess: FamilyAccessService);
    findAll(userId: string, unreadOnly?: boolean): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        userId: string;
        isRead: boolean;
        message: string;
        readAt: Date | null;
    }[]>;
    getUnreadCount(userId: string): Promise<{
        count: number;
    }>;
    markRead(userId: string, id: string): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        userId: string;
        isRead: boolean;
        message: string;
        readAt: Date | null;
    } | null>;
    markAllRead(userId: string): Promise<{
        success: boolean;
    }>;
    create(userId: string, type: NotificationType, title: string, message: string, data?: Record<string, unknown>): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: Prisma.JsonValue | null;
        userId: string;
        isRead: boolean;
        message: string;
        readAt: Date | null;
    }>;
    private normalizeTime;
    private hasRecentDuplicate;
    private getReminderRecipients;
    private notifyMedicineDue;
    private isDoseTakenToday;
    syncMedicineRemindersForUser(userId: string): Promise<{
        synced: boolean;
        created: number;
    }>;
    generateMedicineReminders(): Promise<void>;
    generateDailyFamilySummary(): Promise<void>;
    generateDocumentExpiryReminders(): Promise<void>;
    generateVaccineDueReminders(): Promise<void>;
}
