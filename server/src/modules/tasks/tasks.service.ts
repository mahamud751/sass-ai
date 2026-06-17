import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTaskDto) {
    return this.prisma.task.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId || null,
        title: dto.title,
        description: dto.description,
        priority: dto.priority || 'MEDIUM',
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        isRecurring: dto.isRecurring || false,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.task.findMany({
      where: { userId },
      orderBy: [{ status: 'asc' }, { dueDate: 'asc' }],
      include: { familyMember: true },
    });
  }

  async findToday(userId: string) {
    const today = new Date();
    return this.prisma.task.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
        OR: [{ dueDate: null }, { dueDate: { lte: today } }],
      },
      include: { familyMember: true },
    });
  }

  async updateStatus(userId: string, id: string, status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') {
    const task = await this.prisma.task.findFirst({ where: { id, userId } });
    if (!task) throw new NotFoundException();
    return this.prisma.task.update({
      where: { id },
      data: { status, completedAt: status === 'COMPLETED' ? new Date() : null },
    });
  }
}
