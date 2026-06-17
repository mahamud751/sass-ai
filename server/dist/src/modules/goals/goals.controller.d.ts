import { GoalsService } from './goals.service';
export declare class GoalsController {
    private readonly goalsService;
    constructor(goalsService: GoalsService);
    create(user: any, dto: any): Promise<{
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
    findAll(user: any): Promise<{
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
    update(user: any, id: string, body: {
        progress: number;
    }): Promise<{
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
