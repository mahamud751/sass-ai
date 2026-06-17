import { PrismaService } from '../../prisma/prisma.service';
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: any): Promise<{
        type: import("@prisma/client").$Enums.GoalType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        targetValue: import("@prisma/client/runtime/library").Decimal | null;
        currentValue: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
        progress: number;
        milestones: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    findAll(userId: string): Promise<{
        type: import("@prisma/client").$Enums.GoalType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        targetValue: import("@prisma/client/runtime/library").Decimal | null;
        currentValue: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
        progress: number;
        milestones: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    updateProgress(userId: string, id: string, progress: number): Promise<{
        type: import("@prisma/client").$Enums.GoalType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        dueDate: Date | null;
        completedAt: Date | null;
        targetValue: import("@prisma/client/runtime/library").Decimal | null;
        currentValue: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
        progress: number;
        milestones: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
