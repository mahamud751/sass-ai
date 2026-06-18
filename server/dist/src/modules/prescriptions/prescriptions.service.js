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
exports.PrescriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const date_fns_1 = require("date-fns");
let PrescriptionsService = class PrescriptionsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async verifyFamilyMember(userId, familyMemberId) {
        if (!familyMemberId)
            return;
        const member = await this.prisma.familyMember.findFirst({
            where: { id: familyMemberId, ownerUserId: userId },
        });
        if (!member)
            throw new common_1.ForbiddenException('Invalid family member');
    }
    async create(userId, dto) {
        await this.verifyFamilyMember(userId, dto.familyMemberId);
        const prescription = await this.prisma.prescription.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId || null,
                doctorName: dto.doctorName,
                hospitalName: dto.hospitalName,
                date: new Date(dto.date),
                notes: dto.notes,
                healthRecordId: dto.healthRecordId || null,
                fileId: dto.fileId || null,
                items: {
                    create: dto.items.map((item) => ({
                        medicineName: item.medicineName,
                        dosage: item.dosage,
                        frequency: item.frequency || 'DAILY',
                        times: item.times?.length ? item.times : ['09:00', '21:00'],
                        instruction: item.instruction || 'AFTER_MEAL',
                        durationDays: item.durationDays,
                        notes: item.notes,
                    })),
                },
            },
            include: this.includeRelations(),
        });
        return prescription;
    }
    async findAll(userId, familyMemberId) {
        return this.prisma.prescription.findMany({
            where: {
                userId,
                ...(familyMemberId && { familyMemberId }),
            },
            include: this.includeRelations(),
            orderBy: { date: 'desc' },
        });
    }
    async findOne(userId, id) {
        const rx = await this.prisma.prescription.findFirst({
            where: { id, userId },
            include: this.includeRelations(),
        });
        if (!rx)
            throw new common_1.NotFoundException('Prescription not found');
        return rx;
    }
    async autoAddMedicines(userId, prescriptionId) {
        const prescription = await this.findOne(userId, prescriptionId);
        const pending = prescription.items.filter((i) => !i.medicineId);
        if (pending.length === 0) {
            throw new common_1.BadRequestException('All medicines already added from this prescription');
        }
        const created = [];
        for (const item of pending) {
            const medicine = await this.createMedicineFromItem(userId, prescription, item);
            if (medicine)
                created.push(medicine);
        }
        return {
            prescriptionId,
            addedCount: created.length,
            medicines: created,
        };
    }
    async addMedicineFromItem(userId, prescriptionId, itemId) {
        const prescription = await this.findOne(userId, prescriptionId);
        const item = prescription.items.find((i) => i.id === itemId);
        if (!item)
            throw new common_1.NotFoundException('Prescription item not found');
        if (item.medicineId) {
            throw new common_1.BadRequestException('Medicine already created for this item');
        }
        const medicine = await this.createMedicineFromItem(userId, prescription, item);
        return medicine;
    }
    async createMedicineFromItem(userId, prescription, item) {
        const startDate = prescription.date;
        const endDate = item.durationDays
            ? (0, date_fns_1.addDays)(new Date(startDate), item.durationDays)
            : null;
        const medicine = await this.prisma.medicine.create({
            data: {
                userId,
                familyMemberId: prescription.familyMemberId,
                doctorName: prescription.doctorName,
                name: item.medicineName,
                dosage: item.dosage,
                instruction: item.instruction,
                startDate: new Date(startDate),
                endDate,
                frequency: item.frequency,
                notes: item.notes,
            },
        });
        if (item.times.length > 0) {
            await this.prisma.medicineScheduleTime.createMany({
                data: item.times.map((time) => ({ medicineId: medicine.id, time })),
            });
        }
        await this.prisma.prescriptionItem.update({
            where: { id: item.id },
            data: { medicineId: medicine.id },
        });
        return this.prisma.medicine.findFirst({
            where: { id: medicine.id },
            include: {
                scheduleTimes: true,
                familyMember: { select: { id: true, fullName: true } },
            },
        });
    }
    includeRelations() {
        return {
            familyMember: { select: { id: true, fullName: true, relation: true } },
            items: {
                include: {
                    medicine: {
                        select: { id: true, name: true, dosage: true, isActive: true },
                    },
                },
            },
        };
    }
};
exports.PrescriptionsService = PrescriptionsService;
exports.PrescriptionsService = PrescriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PrescriptionsService);
//# sourceMappingURL=prescriptions.service.js.map