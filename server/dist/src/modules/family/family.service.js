"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FamilyService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../../prisma/prisma.service");
const family_access_service_1 = require("./family-access.service");
const memberInclude = {
    linkedUser: { select: { id: true, email: true, fullName: true } },
};
let FamilyService = class FamilyService {
    prisma;
    familyAccess;
    constructor(prisma, familyAccess) {
        this.prisma = prisma;
        this.familyAccess = familyAccess;
    }
    async createFamily(userId, dto) {
        return this.prisma.familyGroup.create({
            data: {
                name: dto.name,
                description: dto.description,
                ownerId: userId,
            },
            include: { members: { include: memberInclude } },
        });
    }
    async getFamilies(userId) {
        const owned = await this.prisma.familyGroup.findMany({
            where: { ownerId: userId },
            include: {
                members: {
                    orderBy: { createdAt: 'asc' },
                    include: memberInclude,
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const linkedMemberships = await this.prisma.familyMember.findMany({
            where: { linkedUserId: userId },
            select: { familyGroupId: true },
        });
        const ownedIds = new Set(owned.map((f) => f.id));
        const linkedFamilyIds = linkedMemberships
            .map((m) => m.familyGroupId)
            .filter((id) => !ownedIds.has(id));
        if (!linkedFamilyIds.length)
            return owned;
        const linkedFamilies = await this.prisma.familyGroup.findMany({
            where: { id: { in: linkedFamilyIds } },
            include: {
                members: {
                    orderBy: { createdAt: 'asc' },
                    include: memberInclude,
                },
            },
        });
        return [...owned, ...linkedFamilies];
    }
    async getFamilyById(userId, familyId) {
        const canAccess = await this.familyAccess.canAccessFamilyGroup(userId, familyId);
        if (!canAccess)
            throw new common_1.NotFoundException('Family not found');
        const family = await this.prisma.familyGroup.findFirst({
            where: { id: familyId },
            include: { members: { include: memberInclude } },
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
        let linkedUserId = null;
        const loginEmail = (dto.loginEmail || dto.email)?.toLowerCase();
        if (dto.createLogin) {
            if (!loginEmail || !dto.password) {
                throw new common_1.BadRequestException('Email and password are required to create a login');
            }
            const existing = await this.prisma.user.findUnique({
                where: { email: loginEmail },
            });
            if (existing)
                throw new common_1.ConflictException('Email already registered');
            const hashedPassword = await bcrypt.hash(dto.password, 10);
            const linkedUser = await this.prisma.user.create({
                data: {
                    email: loginEmail,
                    password: hashedPassword,
                    fullName: dto.fullName,
                    phone: dto.phone,
                },
            });
            linkedUserId = linkedUser.id;
        }
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
                email: loginEmail || dto.email,
                address: dto.address,
                emergencyContact: dto.emergencyContact,
                notes: dto.notes,
                linkedUserId,
            },
            include: memberInclude,
        });
    }
    async getMembers(userId, familyId) {
        const canAccess = await this.familyAccess.canAccessFamilyGroup(userId, familyId);
        if (!canAccess)
            throw new common_1.ForbiddenException('Access denied');
        return this.prisma.familyMember.findMany({
            where: { familyGroupId: familyId },
            include: memberInclude,
            orderBy: { createdAt: 'asc' },
        });
    }
    async getMemberDetails(userId, memberId) {
        const canAccess = await this.familyAccess.canAccessMember(userId, memberId);
        if (!canAccess)
            throw new common_1.NotFoundException('Family member not found');
        const member = await this.prisma.familyMember.findFirst({
            where: { id: memberId },
            include: {
                familyGroup: true,
                linkedUser: { select: { id: true, email: true, fullName: true } },
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
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_access_service_1.FamilyAccessService])
], FamilyService);
//# sourceMappingURL=family.service.js.map