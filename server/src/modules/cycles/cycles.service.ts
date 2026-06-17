import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';

@Injectable()
export class CyclesService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCycleDto) {
    const created = await this.prisma.menstrualCycle.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId || null,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
        cycleLength: dto.cycleLength,
        flow: dto.flow,
        symptoms: dto.symptoms || [],
        notes: dto.notes,
      },
    });
    return created;
  }

  async findAll(userId: string, familyMemberId?: string) {
    const where: any = { userId };
    if (familyMemberId) where.familyMemberId = familyMemberId;
    return this.prisma.menstrualCycle.findMany({
      where,
      orderBy: { startDate: 'desc' },
      include: { familyMember: { select: { id: true, fullName: true } } },
    });
  }

  async predictNext(userId: string, familyMemberId: string) {
    const logs = await this.prisma.menstrualCycle.findMany({
      where: { userId, familyMemberId },
      orderBy: { startDate: 'desc' },
      take: 6,
    });

    if (logs.length === 0) {
      return { message: 'Not enough data to predict. Log at least one period.' };
    }

    // Simple average cycle length
    const lengths = logs
      .filter(l => l.cycleLength)
      .map(l => l.cycleLength!);

    let avg = 28;
    if (lengths.length > 0) {
      avg = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    } else if (logs.length >= 2) {
      // fallback: compute from consecutive starts
      const diffs: number[] = [];
      for (let i = 1; i < logs.length; i++) {
        const diff = Math.round((logs[i-1].startDate.getTime() - logs[i].startDate.getTime()) / (1000*3600*24));
        if (diff > 15 && diff < 50) diffs.push(diff);
      }
      if (diffs.length) avg = Math.round(diffs.reduce((a,b)=>a+b,0)/diffs.length);
    }

    const lastStart = new Date(logs[0].startDate);
    const next = new Date(lastStart);
    next.setDate(next.getDate() + avg);

    return {
      lastPeriod: lastStart,
      predictedNext: next,
      avgCycleLength: avg,
      basedOn: logs.length,
    };
  }

  async remove(userId: string, id: string) {
    await this.prisma.menstrualCycle.deleteMany({ where: { id, userId } });
    return { success: true };
  }
}
