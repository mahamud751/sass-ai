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
exports.DocumentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DocumentsService = class DocumentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(userId, dto) {
        return this.prisma.document.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId || null,
                type: dto.type,
                title: dto.title,
                description: dto.description,
                fileId: dto.fileId,
                fileUrl: dto.fileUrl,
                tags: dto.tags || [],
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
                secureNotes: dto.secureNotes,
            },
        });
    }
    async findAll(userId, query) {
        const where = { userId };
        if (query?.type)
            where.type = query.type;
        if (query?.familyMemberId)
            where.familyMemberId = query.familyMemberId;
        if (query?.search) {
            where.OR = [
                { title: { contains: query.search, mode: 'insensitive' } },
                { description: { contains: query.search, mode: 'insensitive' } },
            ];
        }
        return this.prisma.document.findMany({
            where,
            include: { familyMember: { select: { id: true, fullName: true } } },
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(userId, id) {
        const doc = await this.prisma.document.findFirst({
            where: { id, userId },
            include: { familyMember: true },
        });
        if (!doc)
            throw new common_1.NotFoundException('Document not found');
        return doc;
    }
    async update(userId, id, dto) {
        await this.findOne(userId, id);
        return this.prisma.document.update({
            where: { id },
            data: {
                ...dto,
                expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : undefined,
                tags: dto.tags,
            },
        });
    }
    async remove(userId, id) {
        await this.findOne(userId, id);
        return this.prisma.document.delete({ where: { id } });
    }
    async search(userId, query) {
        return this.prisma.document.findMany({
            where: {
                userId,
                OR: [
                    { title: { contains: query, mode: 'insensitive' } },
                    { description: { contains: query, mode: 'insensitive' } },
                    { tags: { has: query } },
                ],
            },
            include: { familyMember: true },
        });
    }
};
exports.DocumentsService = DocumentsService;
exports.DocumentsService = DocumentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DocumentsService);
//# sourceMappingURL=documents.service.js.map