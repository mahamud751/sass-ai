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
exports.MedicineService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let MedicineService = class MedicineService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        const { times, startDate, endDate, familyMemberId, ...rest } = dto;
        if (familyMemberId) {
            const member = await this.prisma.familyMember.findFirst({
                where: { id: familyMemberId, ownerUserId: userId },
            });
            if (!member)
                throw new common_1.ForbiddenException('Invalid family member');
        }
        const medicine = await this.prisma.medicine.create({
            data: {
                userId,
                familyMemberId: familyMemberId || null,
                name: rest.name,
                dosage: rest.dosage,
                instruction: rest.instruction || 'AFTER_MEAL',
                customInstruction: rest.customInstruction,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                frequency: rest.frequency || 'DAILY',
                stockCount: rest.stockCount,
                lowStockThreshold: rest.lowStockThreshold,
                notes: rest.notes,
            },
        });
        if (times && times.length > 0) {
            await this.prisma.medicineScheduleTime.createMany({
                data: times.map((t) => ({
                    medicineId: medicine.id,
                    time: t,
                })),
            });
        }
        return this.findOne(userId, medicine.id);
    }
    async findAll(userId, query) {
        return this.prisma.medicine.findMany({
            where: {
                userId,
                ...(query?.familyMemberId && { familyMemberId: query.familyMemberId }),
            },
            include: {
                scheduleTimes: true,
                familyMember: { select: { id: true, fullName: true, relation: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findToday(userId) {
        const today = new Date();
        const medicines = await this.prisma.medicine.findMany({
            where: {
                userId,
                isActive: true,
                startDate: { lte: today },
                OR: [{ endDate: null }, { endDate: { gte: today } }],
            },
            include: {
                scheduleTimes: true,
                logs: {
                    where: {
                        scheduledTime: {
                            gte: (0, date_fns_1.startOfDay)(today),
                            lte: (0, date_fns_1.endOfDay)(today),
                        },
                    },
                },
                familyMember: { select: { id: true, fullName: true } },
            },
        });
        return medicines;
    }
    async findOne(userId, id) {
        const med = await this.prisma.medicine.findFirst({
            where: { id, userId },
            include: {
                scheduleTimes: true,
                logs: { orderBy: { scheduledTime: 'desc' }, take: 20 },
                familyMember: true,
            },
        });
        if (!med)
            throw new common_1.NotFoundException('Medicine not found');
        return med;
    }
    async log(userId, medicineId, dto) {
        const medicine = await this.findOne(userId, medicineId);
        const log = await this.prisma.medicineLog.create({
            data: {
                medicineId,
                scheduledTime: new Date(),
                takenAt: dto.status === 'TAKEN' ? new Date() : null,
                status: dto.status,
                notes: dto.notes,
            },
        });
        if (dto.status === 'TAKEN' && medicine.stockCount !== null) {
            await this.prisma.medicine.update({
                where: { id: medicineId },
                data: { stockCount: Math.max(0, (medicine.stockCount || 0) - 1) },
            });
        }
        return log;
    }
    async getLogs(userId, medicineId) {
        await this.findOne(userId, medicineId);
        return this.prisma.medicineLog.findMany({
            where: { medicineId },
            orderBy: { scheduledTime: 'desc' },
        });
    }
};
exports.MedicineService = MedicineService;
exports.MedicineService = MedicineService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MedicineService);
//# sourceMappingURL=medicine.service.js.map