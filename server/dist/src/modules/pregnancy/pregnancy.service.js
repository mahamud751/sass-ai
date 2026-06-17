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
exports.PregnancyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let PregnancyService = class PregnancyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        await this.prisma.pregnancy.updateMany({
            where: { familyMemberId: dto.familyMemberId, status: 'ACTIVE' },
            data: { status: 'DELIVERED' },
        });
        const preg = await this.prisma.pregnancy.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId,
                lmpDate: dto.lmpDate ? new Date(dto.lmpDate) : null,
                conceptionDate: dto.conceptionDate ? new Date(dto.conceptionDate) : null,
                dueDate: new Date(dto.dueDate),
                status: dto.status || 'ACTIVE',
                notes: dto.notes,
            },
            include: { familyMember: { select: { fullName: true } } },
        });
        return preg;
    }
    async findAll(userId) {
        return this.prisma.pregnancy.findMany({
            where: { userId },
            orderBy: { dueDate: 'asc' },
            include: { familyMember: { select: { id: true, fullName: true, relation: true } } },
        });
    }
    async findOne(userId, id) {
        const p = await this.prisma.pregnancy.findFirst({
            where: { id, userId },
            include: { familyMember: true },
        });
        if (!p)
            throw new common_1.NotFoundException('Pregnancy not found');
        return p;
    }
    async update(userId, id, dto) {
        await this.findOne(userId, id);
        return this.prisma.pregnancy.update({
            where: { id },
            data: {
                lmpDate: dto.lmpDate ? new Date(dto.lmpDate) : undefined,
                dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
                status: dto.status,
                notes: dto.notes,
            },
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.pregnancy.delete({ where: { id } });
    }
    getCurrentWeek(dueDate, lmpDate) {
        const base = lmpDate || new Date(dueDate.getTime() - 280 * 24 * 3600 * 1000);
        const diffDays = Math.floor((Date.now() - base.getTime()) / (1000 * 3600 * 24));
        return Math.max(1, Math.min(42, Math.floor(diffDays / 7)));
    }
};
exports.PregnancyService = PregnancyService;
exports.PregnancyService = PregnancyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PregnancyService);
//# sourceMappingURL=pregnancy.service.js.map