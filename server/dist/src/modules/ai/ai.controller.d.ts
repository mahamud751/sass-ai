import { AiService } from './ai.service';
import { ChatDto, LinkedInPreviewDto } from './dto/chat.dto';
export declare class AiController {
    private readonly aiService;
    constructor(aiService: AiService);
    chat(user: any, dto: ChatDto): Promise<{
        sessionId: string;
        message: string;
        action: "CREATE_TASK" | "SEARCH_DOCUMENT" | "SEARCH_MEDICINE" | "SEARCH_FINANCE" | "CREATE_CAREER_PLAN" | null;
        note: string;
    }>;
    getSessions(user: any): Promise<{
        title: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    getMessages(user: any, id: string): Promise<{
        id: string;
        role: string;
        createdAt: Date;
        sessionId: string;
        content: string;
        action: import("@prisma/client").$Enums.AiActionType | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
    linkedinPreview(dto: LinkedInPreviewDto): Promise<{
        success: boolean;
        linkedin: string;
        error: string;
        fullName?: undefined;
        headline?: undefined;
        location?: undefined;
        summary?: undefined;
        note?: undefined;
    } | {
        success: boolean;
        linkedin: string;
        fullName: string;
        headline: string;
        location: string;
        summary: string;
        note: string;
        error?: undefined;
    }>;
}
