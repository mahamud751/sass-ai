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
exports.HealthService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const family_access_service_1 = require("../family/family-access.service");
let HealthService = class HealthService {
    prisma;
    familyAccess;
    constructor(prisma, familyAccess) {
        this.prisma = prisma;
        this.familyAccess = familyAccess;
    }
    async create(userId, dto) {
        if (dto.familyMemberId) {
            const member = await this.prisma.familyMember.findFirst({
                where: { id: dto.familyMemberId, ownerUserId: userId },
            });
            if (!member) {
                throw new common_1.ForbiddenException('Invalid family member');
            }
        }
        return this.prisma.healthRecord.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId || null,
                type: dto.type,
                title: dto.title,
                doctorName: dto.doctorName,
                hospitalName: dto.hospitalName,
                date: new Date(dto.date),
                diagnosis: dto.diagnosis,
                notes: dto.notes,
            },
        });
    }
    async findAll(userId, memberId) {
        const ctx = await this.familyAccess.getContext(userId);
        return this.prisma.healthRecord.findMany({
            where: {
                ...this.familyAccess.healthVisibilityWhere(ctx),
                ...(memberId && { familyMemberId: memberId }),
            },
            orderBy: { date: 'desc' },
            include: { familyMember: { select: { fullName: true } } },
        });
    }
    async findByMember(userId, memberId) {
        return this.findAll(userId, memberId);
    }
};
exports.HealthService = HealthService;
exports.HealthService = HealthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_access_service_1.FamilyAccessService])
], HealthService);
//# sourceMappingURL=health.service.js.map