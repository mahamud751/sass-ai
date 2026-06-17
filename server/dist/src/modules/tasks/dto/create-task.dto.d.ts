import { TaskPriority } from '@prisma/client';
export declare class CreateTaskDto {
    title: string;
    description?: string;
    priority?: TaskPriority;
    dueDate?: string;
    familyMemberId?: string;
    isRecurring?: boolean;
}
