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
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDashboard(userId) {
        const today = new Date();
        const monthStart = (0, date_fns_1.startOfMonth)(today);
        const monthEnd = (0, date_fns_1.endOfMonth)(today);
        const todayMedicines = await this.prisma.medicine.findMany({
            where: {
                userId,
                isActive: true,
                startDate: { lte: today },
                OR: [{ endDate: null }, { endDate: { gte: today } }],
            },
            include: { scheduleTimes: true, familyMember: { select: { fullName: true } } },
            take: 8,
        });
        const pendingTasks = await this.prisma.task.findMany({
            where: {
                userId,
                status: { in: ['PENDING', 'IN_PROGRESS'] },
            },
            include: { familyMember: { select: { fullName: true } } },
            orderBy: { dueDate: 'asc' },
            take: 6,
        });
        const upcomingDates = await this.prisma.importantDate.findMany({
            where: {
                userId,
                date: { gte: today },
            },
            orderBy: { date: 'asc' },
            take: 6,
        });
        const transactions = await this.prisma.financeTransaction.findMany({
            where: {
                userId,
                date: { gte: monthStart, lte: monthEnd },
            },
        });
        const income = transactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const recentDocuments = await this.prisma.document.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: { familyMember: { select: { fullName: true } } },
        });
        const families = await this.prisma.familyGroup.findMany({
            where: { ownerId: userId },
            include: { members: { take: 4 } },
        });
        const expiringDocs = await this.prisma.document.count({
            where: {
                userId,
                expiryDate: { gte: today, lte: new Date(today.getTime() + 1000 * 3600 * 24 * 45) },
            },
        });
        return {
            todayMedicines: todayMedicines.length,
            medicinesList: todayMedicines,
            pendingTasks: pendingTasks.length,
            tasksList: pendingTasks,
            monthlySummary: {
                income,
                expense,
                net: income - expense,
                currency: 'BDT',
            },
            upcomingImportantDates: upcomingDates,
            recentDocuments,
            familyGroups: families,
            expiringDocumentsCount: expiringDocs,
            aiSuggestions: [
                'Review your mother’s medicine schedule for today',
                'Update passport expiry reminders',
                'Log yesterday’s expenses',
            ],
        };
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map