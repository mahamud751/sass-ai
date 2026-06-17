import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GoalsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: any) {
    return this.prisma.goal.create({ data: { userId, ...dto } });
  }

  async findAll(userId: string) {
    return this.prisma.goal.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } });
  }

  async updateProgress(userId: string, id: string, progress: number) {
    return this.prisma.goal.update({
      where: { id },
      data: { progress, currentValue: progress },
    });
  }
}
