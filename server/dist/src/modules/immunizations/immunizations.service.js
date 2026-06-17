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
exports.ImmunizationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ImmunizationsService = class ImmunizationsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.immunization.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId,
                vaccineName: dto.vaccineName,
                scheduledDate: new Date(dto.scheduledDate),
                administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : null,
                dose: dto.dose || 1,
                batchNumber: dto.batchNumber,
                location: dto.location,
                notes: dto.notes,
                documentId: dto.documentId,
            },
            include: { familyMember: { select: { fullName: true } } },
        });
    }
    async findAll(userId, familyMemberId) {
        const where = { userId };
        if (familyMemberId)
            where.familyMemberId = familyMemberId;
        return this.prisma.immunization.findMany({
            where,
            orderBy: { scheduledDate: 'asc' },
            include: { familyMember: { select: { id: true, fullName: true } } },
        });
    }
    async getDue(userId) {
        const today = new Date();
        return this.prisma.immunization.findMany({
            where: {
                userId,
                administeredDate: null,
                scheduledDate: { lte: today },
            },
            include: { familyMember: { select: { fullName: true } } },
            orderBy: { scheduledDate: 'asc' },
        });
    }
    async markGiven(userId, id, body) {
        const imm = await this.prisma.immunization.findFirst({ where: { id, userId } });
        if (!imm)
            throw new common_1.NotFoundException();
        return this.prisma.immunization.update({
            where: { id },
            data: {
                administeredDate: body.administeredDate ? new Date(body.administeredDate) : new Date(),
                notes: body.notes ? `${imm.notes || ''} ${body.notes}`.trim() : imm.notes,
            },
        });
    }
    async remove(userId, id) {
        await this.prisma.immunization.deleteMany({ where: { id, userId } });
        return { success: true };
    }
    getStandardSchedule(birthDate) {
        const b = new Date(birthDate);
        const addWeeks = (w) => new Date(b.getTime() + w * 7 * 86400000);
        return [
            { vaccineName: 'BCG + Hep B (birth dose)', scheduled: b, dose: 1 },
            { vaccineName: 'Polio-1 + DPT-1 + Hib-1 + Hep B-2', scheduled: addWeeks(6), dose: 1 },
            { vaccineName: 'Polio-2 + DPT-2 + Hib-2', scheduled: addWeeks(10), dose: 2 },
            { vaccineName: 'Polio-3 + DPT-3 + Hib-3 + Hep B-3', scheduled: addWeeks(14), dose: 3 },
            { vaccineName: 'Measles + Rubella (MR-1)', scheduled: addWeeks(36), dose: 1 },
            { vaccineName: 'Polio Booster + DPT Booster', scheduled: addWeeks(72), dose: 1 },
        ];
    }
};
exports.ImmunizationsService = ImmunizationsService;
exports.ImmunizationsService = ImmunizationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ImmunizationsService);
//# sourceMappingURL=immunizations.service.js.map