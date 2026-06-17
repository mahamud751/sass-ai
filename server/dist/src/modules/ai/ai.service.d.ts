import { PrismaService } from '../../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { ChatDto } from './dto/chat.dto';
export declare class AiService {
    private prisma;
    private config;
    private openai;
    private model;
    private hasRealLLM;
    constructor(prisma: PrismaService, config: ConfigService);
    chat(userId: string, dto: ChatDto): Promise<{
        sessionId: string;
        message: string;
        action: "CREATE_TASK" | "SEARCH_DOCUMENT" | "SEARCH_MEDICINE" | "SEARCH_FINANCE" | "CREATE_CAREER_PLAN" | null;
        note: string;
    }>;
    getSessions(userId: string): Promise<{
        id: string;
        title: string | null;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
    }[]>;
    getMessages(userId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        sessionId: string;
        role: string;
        content: string;
        action: import("@prisma/client").$Enums.AiActionType | null;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }[]>;
}
