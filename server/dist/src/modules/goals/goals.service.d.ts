import { PrismaService } from '../../prisma/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
export declare class GoalsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateGoalDto): Promise<{
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
    findAll(userId: string): Promise<{
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
    updateProgress(userId: string, id: string, progress: number): Promise<{
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
