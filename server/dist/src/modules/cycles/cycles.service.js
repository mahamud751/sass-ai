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
exports.CyclesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CyclesService = class CyclesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const created = await this.prisma.menstrualCycle.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId || null,
                startDate: new Date(dto.startDate),
                endDate: dto.endDate ? new Date(dto.endDate) : null,
                cycleLength: dto.cycleLength,
                flow: dto.flow,
                symptoms: dto.symptoms || [],
                notes: dto.notes,
            },
        });
        return created;
    }
    async findAll(userId, familyMemberId) {
        const where = { userId };
        if (familyMemberId)
            where.familyMemberId = familyMemberId;
        return this.prisma.menstrualCycle.findMany({
            where,
            orderBy: { startDate: 'desc' },
            include: { familyMember: { select: { id: true, fullName: true } } },
        });
    }
    async predictNext(userId, familyMemberId) {
        const logs = await this.prisma.menstrualCycle.findMany({
            where: { userId, familyMemberId },
            orderBy: { startDate: 'desc' },
            take: 6,
        });
        if (logs.length === 0) {
            return { message: 'Not enough data to predict. Log at least one period.' };
        }
        const lengths = logs
            .filter(l => l.cycleLength)
            .map(l => l.cycleLength);
        let avg = 28;
        if (lengths.length > 0) {
            avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
        }
        else if (logs.length >= 2) {
            const diffs = [];
            for (let i = 1; i < logs.length; i++) {
                const diff = Math.round((logs[i - 1].startDate.getTime() - logs[i].startDate.getTime()) / (1000 * 3600 * 24));
                if (diff > 15 && diff < 50)
                    diffs.push(diff);
            }
            if (diffs.length)
                avg = Math.round(diffs.reduce((a, b) => a + b, 0) / diffs.length);
        }
        const lastStart = new Date(logs[0].startDate);
        const next = new Date(lastStart);
        next.setDate(next.getDate() + avg);
        return {
            lastPeriod: lastStart,
            predictedNext: next,
            avgCycleLength: avg,
            basedOn: logs.length,
        };
    }
    async remove(userId, id) {
        await this.prisma.menstrualCycle.deleteMany({ where: { id, userId } });
        return { success: true };
    }
};
exports.CyclesService = CyclesService;
exports.CyclesService = CyclesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CyclesService);
//# sourceMappingURL=cycles.service.js.map