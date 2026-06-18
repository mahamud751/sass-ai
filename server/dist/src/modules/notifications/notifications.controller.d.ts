import { NotificationsService } from './notifications.service';
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    findAll(user: any, unreadOnly?: string): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        message: string;
        readAt: Date | null;
    }[]>;
    getUnreadCount(user: any): Promise<{
        count: number;
    }>;
    sync(user: any): Promise<{
        synced: boolean;
        created: number;
    }>;
    markAllRead(user: any): Promise<{
        success: boolean;
    }>;
    markRead(user: any, id: string): Promise<{
        type: import("@prisma/client").$Enums.NotificationType;
        title: string;
        id: string;
        createdAt: Date;
        data: import("@prisma/client/runtime/library").JsonValue | null;
        userId: string;
        isRead: boolean;
        message: string;
        readAt: Date | null;
    } | null>;
}
