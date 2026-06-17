import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';

@Injectable()
export class PregnancyService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreatePregnancyDto) {
    // Only one active per member typically - close previous actives
    await this.prisma.pregnancy.updateMany({
      where: { familyMemberId: dto.familyMemberId, status: 'ACTIVE' },
      data: { status: 'DELIVERED' },
    });

    const preg = await this.prisma.pregnancy.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId,
        lmpDate: dto.lmpDate ? new Date(dto.lmpDate) : null,
        conceptionDate: dto.conceptionDate ? new Date(dto.conceptionDate) : null,
        dueDate: new Date(dto.dueDate),
        status: dto.status || 'ACTIVE',
        notes: dto.notes,
      },
      include: { familyMember: { select: { fullName: true } } },
    });
    return preg;
  }

  async findAll(userId: string) {
    return this.prisma.pregnancy.findMany({
      where: { userId },
      orderBy: { dueDate: 'asc' },
      include: { familyMember: { select: { id: true, fullName: true, relation: true } } },
    });
  }

  async findOne(userId: string, id: string) {
    const p = await this.prisma.pregnancy.findFirst({
      where: { id, userId },
      include: { familyMember: true },
    });
    if (!p) throw new NotFoundException('Pregnancy not found');
    return p;
  }

  async update(userId: string, id: string, dto: Partial<CreatePregnancyDto>) {
    await this.findOne(userId, id);
    return this.prisma.pregnancy.update({
      where: { id },
      data: {
        lmpDate: dto.lmpDate ? new Date(dto.lmpDate) : undefined,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : undefined,
        status: dto.status,
        notes: dto.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    return this.prisma.pregnancy.delete({ where: { id } });
  }

  // Helper used by AI or reminders
  getCurrentWeek(dueDate: Date, lmpDate?: Date | null): number {
    const base = lmpDate || new Date(dueDate.getTime() - 280 * 24 * 3600 * 1000); // ~40w
    const diffDays = Math.floor((Date.now() - base.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, Math.min(42, Math.floor(diffDays / 7)));
  }
}
