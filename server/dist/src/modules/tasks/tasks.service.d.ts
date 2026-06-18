import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';
export declare class TasksService {
    private prisma;
    constructor(prisma: PrismaService);
    create(userId: string, dto: CreateTaskDto): Promise<{
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
    }>;
    findAll(userId: string): Promise<({
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
    })[]>;
    findToday(userId: string): Promise<({
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
    })[]>;
    updateStatus(userId: string, id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Promise<{
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
    }>;
}
