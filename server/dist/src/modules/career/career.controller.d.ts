import { CareerService } from './career.service';
import { CreateCareerGoalDto } from './dto/create-career-goal.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
export declare class CareerController {
    private readonly careerService;
    constructor(careerService: CareerService);
    createGoal(user: any, dto: CreateCareerGoalDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        roadmap: import("@prisma/client/runtime/library").JsonValue | null;
        targetRole: string;
        targetCompany: string | null;
        salaryGoal: import("@prisma/client/runtime/library").Decimal | null;
        skills: string[];
        currentSkills: string[];
        targetDate: Date | null;
    }>;
    getGoals(user: any): Promise<({
        familyMember: {
            fullName: string;
            id: string;
        } | null;
        jobApplications: {
            id: string;
            role: string;
            createdAt: Date;
            updatedAt: Date;
            notes: string | null;
            userId: string;
            status: import("@prisma/client").$Enums.JobApplicationStatus;
            careerGoalId: string | null;
            company: string;
            appliedDate: Date;
            interviewDate: Date | null;
            salaryOffered: import("@prisma/client/runtime/library").Decimal | null;
            jobUrl: string | null;
            resumeFileId: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        roadmap: import("@prisma/client/runtime/library").JsonValue | null;
        targetRole: string;
        targetCompany: string | null;
        salaryGoal: import("@prisma/client/runtime/library").Decimal | null;
        skills: string[];
        currentSkills: string[];
        targetDate: Date | null;
    })[]>;
    updateGoal(user: any, id: string, dto: Partial<CreateCareerGoalDto>): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        roadmap: import("@prisma/client/runtime/library").JsonValue | null;
        targetRole: string;
        targetCompany: string | null;
        salaryGoal: import("@prisma/client/runtime/library").Decimal | null;
        skills: string[];
        currentSkills: string[];
        targetDate: Date | null;
    }>;
    deleteGoal(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        roadmap: import("@prisma/client/runtime/library").JsonValue | null;
        targetRole: string;
        targetCompany: string | null;
        salaryGoal: import("@prisma/client/runtime/library").Decimal | null;
        skills: string[];
        currentSkills: string[];
        targetDate: Date | null;
    }>;
    createApp(user: any, dto: CreateJobApplicationDto): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        status: import("@prisma/client").$Enums.JobApplicationStatus;
        careerGoalId: string | null;
        company: string;
        appliedDate: Date;
        interviewDate: Date | null;
        salaryOffered: import("@prisma/client/runtime/library").Decimal | null;
        jobUrl: string | null;
        resumeFileId: string | null;
    }>;
    getApps(user: any, goalId?: string): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        status: import("@prisma/client").$Enums.JobApplicationStatus;
        careerGoalId: string | null;
        company: string;
        appliedDate: Date;
        interviewDate: Date | null;
        salaryOffered: import("@prisma/client/runtime/library").Decimal | null;
        jobUrl: string | null;
        resumeFileId: string | null;
    }[]>;
    updateAppStatus(user: any, id: string, body: {
        status: string;
        interviewDate?: string;
    }): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        status: import("@prisma/client").$Enums.JobApplicationStatus;
        careerGoalId: string | null;
        company: string;
        appliedDate: Date;
        interviewDate: Date | null;
        salaryOffered: import("@prisma/client/runtime/library").Decimal | null;
        jobUrl: string | null;
        resumeFileId: string | null;
    }>;
    generateRoadmap(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        notes: string | null;
        userId: string;
        familyMemberId: string | null;
        roadmap: import("@prisma/client/runtime/library").JsonValue | null;
        targetRole: string;
        targetCompany: string | null;
        salaryGoal: import("@prisma/client/runtime/library").Decimal | null;
        skills: string[];
        currentSkills: string[];
        targetDate: Date | null;
    }>;
    analyzeSkills(user: any, id: string): Promise<{
        currentSkills: string[];
        targetSkills: string[];
        matchPercentage: number;
        gaps: string[];
        suggestions: string[];
    }>;
    generateCV(user: any, id: string): Promise<{
        summary: string;
        skills: string[];
        targetRole: string;
        experience: any;
        education: any;
        generatedFor: string;
    }>;
}
