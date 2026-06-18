import { GoalsService } from './goals.service';
import { CreateGoalDto } from './dto/create-goal.dto';
export declare class GoalsController {
    private readonly goalsService;
    constructor(goalsService: GoalsService);
    create(user: any, dto: CreateGoalDto): Promise<{
        type: import("@prisma/client").$Enums.GoalType;
        description: string | null;
        title: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        familyMemberId: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        progress: number;
        targetValue: import("@prisma/client/runtime/library").Decimal | null;
        currentValue: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
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
        familyMemberId: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        progress: number;
        targetValue: import("@prisma/client/runtime/library").Decimal | null;
        currentValue: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
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
        familyMemberId: string | null;
        dueDate: Date | null;
        completedAt: Date | null;
        progress: number;
        targetValue: import("@prisma/client/runtime/library").Decimal | null;
        currentValue: import("@prisma/client/runtime/library").Decimal | null;
        unit: string | null;
        milestones: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
}
