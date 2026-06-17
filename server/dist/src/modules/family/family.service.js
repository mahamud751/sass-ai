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
exports.FamilyService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FamilyService = class FamilyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createFamily(userId, dto) {
        return this.prisma.familyGroup.create({
            data: {
                name: dto.name,
                description: dto.description,
                ownerId: userId,
            },
            include: { members: true },
        });
    }
    async getFamilies(userId) {
        return this.prisma.familyGroup.findMany({
            where: { ownerId: userId },
            include: {
                members: {
                    orderBy: { createdAt: 'asc' },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getFamilyById(userId, familyId) {
        const family = await this.prisma.familyGroup.findFirst({
            where: { id: familyId, ownerId: userId },
            include: { members: true },
        });
        if (!family)
            throw new common_1.NotFoundException('Family not found');
        return family;
    }
    async addMember(userId, familyId, dto) {
        const family = await this.prisma.familyGroup.findFirst({
            where: { id: familyId, ownerId: userId },
        });
        if (!family)
            throw new common_1.ForbiddenException('Not your family group');
        return this.prisma.familyMember.create({
            data: {
                familyGroupId: familyId,
                ownerUserId: userId,
                fullName: dto.fullName,
                relation: dto.relation,
                gender: dto.gender || 'UNKNOWN',
                dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
                bloodGroup: dto.bloodGroup || 'UNKNOWN',
                phone: dto.phone,
                email: dto.email,
                address: dto.address,
                emergencyContact: dto.emergencyContact,
                notes: dto.notes,
            },
        });
    }
    async getMembers(userId, familyId) {
        const family = await this.prisma.familyGroup.findFirst({
            where: { id: familyId, ownerId: userId },
        });
        if (!family)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.familyMember.findMany({
            where: { familyGroupId: familyId },
            orderBy: { createdAt: 'asc' },
        });
    }
    async getMemberDetails(userId, memberId) {
        const member = await this.prisma.familyMember.findFirst({
            where: {
                id: memberId,
                ownerUserId: userId,
            },
            include: {
                familyGroup: true,
            },
        });
        if (!member)
            throw new common_1.NotFoundException('Family member not found');
        return member;
    }
};
exports.FamilyService = FamilyService;
exports.FamilyService = FamilyService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FamilyService);
//# sourceMappingURL=family.service.js.map