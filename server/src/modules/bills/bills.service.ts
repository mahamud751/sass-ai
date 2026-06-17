import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BillsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: any) {
    return this.prisma.billSubscription.create({ data: { userId, ...dto } });
  }

  async findAll(userId: string) {
    return this.prisma.billSubscription.findMany({ where: { userId }, orderBy: { dueDate: 'asc' } });
  }

  async markPaid(userId: string, id: string) {
    return this.prisma.billSubscription.update({
      where: { id },
      data: { isPaid: true, lastPaidDate: new Date() },
    });
  }
}
