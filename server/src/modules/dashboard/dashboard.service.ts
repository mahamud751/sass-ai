import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { startOfMonth, endOfMonth } from 'date-fns';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const today = new Date();
    const monthStart = startOfMonth(today);
    const monthEnd = endOfMonth(today);

    // Today's medicines
    const todayMedicines = await this.prisma.medicine.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: { scheduleTimes: true, familyMember: { select: { fullName: true } } },
      take: 8,
    });

    // Pending tasks
    const pendingTasks = await this.prisma.task.findMany({
      where: {
        userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
      include: { familyMember: { select: { fullName: true } } },
      orderBy: { dueDate: 'asc' },
      take: 6,
    });

    // Upcoming important dates
    const upcomingDates = await this.prisma.importantDate.findMany({
      where: {
        userId,
        date: { gte: today },
      },
      orderBy: { date: 'asc' },
      take: 6,
    });

    // Monthly finance summary
    const transactions = await this.prisma.financeTransaction.findMany({
      where: {
        userId,
        date: { gte: monthStart, lte: monthEnd },
      },
    });
    const income = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    const expense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Recent documents
    const recentDocuments = await this.prisma.document.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { familyMember: { select: { fullName: true } } },
    });

    // Family cards (summary)
    const families = await this.prisma.familyGroup.findMany({
      where: { ownerId: userId },
      include: { members: { take: 4 } },
    });

    // Expiring documents
    const expiringDocs = await this.prisma.document.count({
      where: {
        userId,
        expiryDate: { gte: today, lte: new Date(today.getTime() + 1000 * 3600 * 24 * 45) },
      },
    });

    return {
      todayMedicines: todayMedicines.length,
      medicinesList: todayMedicines,
      pendingTasks: pendingTasks.length,
      tasksList: pendingTasks,
      monthlySummary: {
        income,
        expense,
        net: income - expense,
        currency: 'BDT',
      },
      upcomingImportantDates: upcomingDates,
      recentDocuments,
      familyGroups: families,
      expiringDocumentsCount: expiringDocs,
      aiSuggestions: [
        'Review your mother’s medicine schedule for today',
        'Update passport expiry reminders',
        'Log yesterday’s expenses',
      ],
    };
  }
}
