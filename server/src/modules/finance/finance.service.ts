import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class FinanceService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateTransactionDto) {
    return this.prisma.financeTransaction.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId || null,
        type: dto.type,
        amount: dto.amount,
        currency: dto.currency || 'BDT',
        category: dto.category,
        description: dto.description,
        date: new Date(dto.date),
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.financeTransaction.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      include: { familyMember: true },
    });
  }

  async getMonthlySummary(userId: string, year?: number, month?: number) {
    const now = new Date();
    const y = year ?? now.getFullYear();
    const m = month ?? now.getMonth() + 1;

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);

    const txs = await this.prisma.financeTransaction.findMany({
      where: { userId, date: { gte: start, lte: end } },
    });

    const income = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Number(t.amount), 0);
    const expense = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Number(t.amount), 0);

    return { year: y, month: m, income, expense, net: income - expense, currency: 'BDT' };
  }
}
