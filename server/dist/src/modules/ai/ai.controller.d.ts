import { AiService } from './ai.service';
import { ChatDto } from './dto/chat.dto';
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
        id: string;
        title: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    getMessages(user: any, id: string): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        role: string;
        content: string;
        action: import("@prisma/client").$Enums.AiActionType | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
