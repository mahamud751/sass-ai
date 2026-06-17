"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const client_1 = require("@prisma/client");
const openai_1 = __importDefault(require("openai"));
let AiService = class AiService {
    prisma;
    config;
    openai = null;
    model;
    hasRealLLM = false;
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
        const openaiConfig = this.config.get('openai') || {};
        const apiKey = openaiConfig.apiKey;
        if (apiKey) {
            this.openai = new openai_1.default({
                apiKey,
                baseURL: openaiConfig.baseUrl || 'https://api.openai.com/v1',
            });
            this.model = openaiConfig.model || 'gpt-4o-mini';
            this.hasRealLLM = true;
            console.log('✅ Real LLM connected via OpenAI-compatible API');
        }
        else {
            console.warn('⚠️  No OPENAI_API_KEY found. Using placeholder AI responses. Add key to .env for real CV, roadmap, interview features.');
            this.model = 'placeholder';
        }
    }
    async chat(userId, dto) {
        let sessionId = dto.sessionId;
        if (!sessionId) {
            const session = await this.prisma.aiChatSession.create({
                data: { userId, title: dto.message.slice(0, 50) },
            });
            sessionId = session.id;
        }
        await this.prisma.aiChatMessage.create({
            data: {
                sessionId,
                role: 'user',
                content: dto.message,
            },
        });
        let response = '';
        let action = null;
        if (this.hasRealLLM && this.openai) {
            try {
                const completion = await this.openai.chat.completions.create({
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: `You are LifeMate AI, a helpful life assistant for a full-stack SaaS app (health, family, finance, career, documents, tasks).
Be concise, practical, and friendly. For career features like CVs, roadmaps, interviews:
- Generate professional, structured output.
- Use the user's provided data (skills, role, etc.).
- Suggest actionable steps.
- For CVs: output clean professional sections.
If the user asks for actions (create task, search data), suggest them but note that the app will handle execution.`,
                        },
                        {
                            role: 'user',
                            content: dto.message,
                        },
                    ],
                    temperature: 0.7,
                    max_tokens: 800,
                });
                response = completion.choices[0]?.message?.content?.trim() ||
                    "I couldn't generate a response. Please try again.";
                const lower = dto.message.toLowerCase();
                if (lower.includes('cv') || lower.includes('resume') || lower.includes('generate cv')) {
                    action = client_1.AiActionType.CREATE_CAREER_PLAN;
                }
                else if (lower.includes('roadmap')) {
                    action = client_1.AiActionType.CREATE_CAREER_PLAN;
                }
                else if (lower.includes('interview')) {
                    action = client_1.AiActionType.CREATE_CAREER_PLAN;
                }
                else if (lower.includes('remind') || lower.includes('task')) {
                    action = client_1.AiActionType.CREATE_TASK;
                }
            }
            catch (err) {
                console.error('LLM call failed:', err.message || err);
                if (err.code === 'insufficient_quota' || err.status === 429) {
                    response = "OpenAI quota exceeded. Please add billing/credits at platform.openai.com or switch to a cheaper provider (e.g. Groq). Using fallback for now.";
                }
                else {
                    response = "Sorry, there was an error connecting to the AI model. Using fallback.";
                }
            }
        }
        if (!response) {
            const lower = dto.message.toLowerCase();
            response = "I'm LifeMate AI. I can help with your life data (medicines, finance, career, documents, tasks). Set OPENAI_API_KEY for full AI-powered CVs, roadmaps and interview feedback.";
            if (lower.includes('medicine') && lower.includes('mother')) {
                response = "Let me fetch your mother's current medicines. (Enable real LLM for better personalization)";
                action = client_1.AiActionType.SEARCH_MEDICINE;
            }
            else if (lower.includes('passport') || lower.includes('document')) {
                response = "Searching your documents...";
                action = client_1.AiActionType.SEARCH_DOCUMENT;
            }
            else if (lower.includes('spent') || lower.includes('expense')) {
                response = "Fetching your monthly finance summary...";
                action = client_1.AiActionType.SEARCH_FINANCE;
            }
            else if (lower.includes('roadmap') || lower.includes('career')) {
                response = "Sample career roadmap steps would appear here with a real LLM. Configure OPENAI_API_KEY for proper generation.";
                action = client_1.AiActionType.CREATE_CAREER_PLAN;
            }
            else if (lower.includes('remind') || lower.includes('task')) {
                response = "Creating a task/reminder for you.";
                action = client_1.AiActionType.CREATE_TASK;
            }
            else if (lower.includes('cv') || lower.includes('resume') || lower.includes('generate cv')) {
                response = "[Real LLM would output a clean professional summary here tailored to the role, followed by skills, experience, education sections in markdown]. Configure OPENAI_API_KEY for full generation.";
                action = client_1.AiActionType.CREATE_CAREER_PLAN;
            }
        }
        await this.prisma.aiChatMessage.create({
            data: {
                sessionId,
                role: 'assistant',
                content: response,
                action: action || undefined,
                metadata: {
                    llm: this.hasRealLLM ? this.model : 'placeholder',
                    demo: !this.hasRealLLM
                },
            },
        });
        return {
            sessionId,
            message: response,
            action,
            note: this.hasRealLLM
                ? `Powered by ${this.model} (OpenAI-compatible)`
                : 'Placeholder mode. Set OPENAI_API_KEY (and optionally OPENAI_BASE_URL / OPENAI_MODEL) in .env for real AI CVs, roadmaps, interviews, analysis etc. Any OpenAI-compatible provider works (including local Ollama).',
        };
    }
    async getSessions(userId) {
        return this.prisma.aiChatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: 'desc' },
            take: 20,
        });
    }
    async getMessages(userId, sessionId) {
        const session = await this.prisma.aiChatSession.findFirst({
            where: { id: sessionId, userId },
        });
        if (!session)
            return [];
        return this.prisma.aiChatMessage.findMany({
            where: { sessionId },
            orderBy: { createdAt: 'asc' },
        });
    }
};
exports.AiService = AiService;
exports.AiService = AiService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], AiService);
//# sourceMappingURL=ai.service.js.map