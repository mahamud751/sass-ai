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
exports.FamilyAccessService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let FamilyAccessService = class FamilyAccessService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getContext(userId) {
        const linkedMembers = await this.prisma.familyMember.findMany({
            where: { linkedUserId: userId },
            select: { id: true, ownerUserId: true },
        });
        const ownedFamilyCount = await this.prisma.familyGroup.count({
            where: { ownerId: userId },
        });
        return {
            userId,
            isCaregiver: ownedFamilyCount > 0,
            isLinkedMember: linkedMembers.length > 0,
            linkedMemberIds: linkedMembers.map((m) => m.id),
            caregiverUserIds: [...new Set(linkedMembers.map((m) => m.ownerUserId))],
        };
    }
    medicineVisibilityWhere(ctx) {
        const or = [];
        if (ctx.isCaregiver) {
            or.push({ userId: ctx.userId });
        }
        if (ctx.linkedMemberIds.length) {
            or.push({ familyMemberId: { in: ctx.linkedMemberIds } });
        }
        if (!or.length) {
            or.push({ userId: ctx.userId });
        }
        return { OR: or };
    }
    healthVisibilityWhere(ctx) {
        const or = [];
        if (ctx.isCaregiver) {
            or.push({ userId: ctx.userId });
        }
        if (ctx.linkedMemberIds.length) {
            or.push({ familyMemberId: { in: ctx.linkedMemberIds } });
        }
        if (!or.length) {
            or.push({ userId: ctx.userId });
        }
        return { OR: or };
    }
    async canAccessFamilyGroup(userId, familyId) {
        const owner = await this.prisma.familyGroup.findFirst({
            where: { id: familyId, ownerId: userId },
        });
        if (owner)
            return true;
        const linked = await this.prisma.familyMember.findFirst({
            where: { familyGroupId: familyId, linkedUserId: userId },
        });
        return !!linked;
    }
    async canAccessMember(userId, memberId) {
        const member = await this.prisma.familyMember.findFirst({
            where: {
                id: memberId,
                OR: [{ ownerUserId: userId }, { linkedUserId: userId }],
            },
        });
        return !!member;
    }
};
exports.FamilyAccessService = FamilyAccessService;
exports.FamilyAccessService = FamilyAccessService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FamilyAccessService);
//# sourceMappingURL=family-access.service.js.map