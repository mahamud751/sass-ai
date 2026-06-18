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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let GoalsService = class GoalsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.goal.create({
            data: {
                userId,
                title: dto.title,
                type: dto.type,
                description: dto.description,
                progress: dto.progress ?? 0,
                familyMemberId: dto.familyMemberId || null,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.goal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async updateProgress(userId, id, progress) {
        const goal = await this.prisma.goal.findFirst({ where: { id, userId } });
        if (!goal)
            throw new common_1.NotFoundException('Goal not found');
        return this.prisma.goal.update({
            where: { id },
            data: { progress },
        });
    }
};
exports.GoalsService = GoalsService;
exports.GoalsService = GoalsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GoalsService);
//# sourceMappingURL=goals.service.js.map