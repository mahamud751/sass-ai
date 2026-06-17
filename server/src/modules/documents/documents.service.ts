import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateDocumentDto) {
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

  async findAll(userId: string, query?: any) {
    const where: any = { userId };
    if (query?.type) where.type = query.type;
    if (query?.familyMemberId) where.familyMemberId = query.familyMemberId;
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

  async findOne(userId: string, id: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id, userId },
      include: { familyMember: true },
    });
    if (!doc) throw new NotFoundException('Document not found');
    return doc;
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
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

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.document.delete({ where: { id } });
  }

  async search(userId: string, query: string) {
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
}
