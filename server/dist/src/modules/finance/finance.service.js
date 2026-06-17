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
exports.FinanceService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FinanceService = class FinanceService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.financeTransaction.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId || null,
                type: dto.type,
                amount: dto.amount,
                currency: dto.currency || 'BDT',
                category: dto.category,
                description: dto.description,
                date: new Date(dto.date),
                notes: dto.notes,
            },
        });
    }
    async findAll(userId) {
        return this.prisma.financeTransaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            include: { familyMember: true },
        });
    }
    async getMonthlySummary(userId, year, month) {
        const now = new Date();
        const y = year ?? now.getFullYear();
        const m = month ?? now.getMonth() + 1;
        const start = new Date(y, m - 1, 1);
        const end = new Date(y, m, 0);
        const txs = await this.prisma.financeTransaction.findMany({
            where: { userId, date: { gte: start, lte: end } },
        });
        const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
        const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);
        return { year: y, month: m, income, expense, net: income - expense, currency: 'BDT' };
    }
};
exports.FinanceService = FinanceService;
exports.FinanceService = FinanceService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FinanceService);
//# sourceMappingURL=finance.service.js.map