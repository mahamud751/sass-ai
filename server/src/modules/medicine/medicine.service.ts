import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { LogMedicineDto } from './dto/log-medicine.dto';
import { startOfDay, endOfDay } from 'date-fns';

@Injectable()
export class MedicineService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateMedicineDto) {
    const { times, startDate, endDate, familyMemberId, ...rest } = dto;

    // Verify family member belongs to user if provided
    if (familyMemberId) {
      const member = await this.prisma.familyMember.findFirst({
        where: { id: familyMemberId, ownerUserId: userId },
      });
      if (!member) throw new ForbiddenException('Invalid family member');
    }

    const medicine = await this.prisma.medicine.create({
      data: {
        userId,
        familyMemberId: familyMemberId || null,
        name: rest.name,
        dosage: rest.dosage,
        instruction: rest.instruction || 'AFTER_MEAL',
        customInstruction: rest.customInstruction,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        frequency: rest.frequency || 'DAILY',
        stockCount: rest.stockCount,
        lowStockThreshold: rest.lowStockThreshold,
        notes: rest.notes,
      },
    });

    if (times && times.length > 0) {
      await this.prisma.medicineScheduleTime.createMany({
        data: times.map((t) => ({
          medicineId: medicine.id,
          time: t,
        })),
      });
    }

    return this.findOne(userId, medicine.id);
  }

  async findAll(userId: string, query?: { familyMemberId?: string }) {
    return this.prisma.medicine.findMany({
      where: {
        userId,
        ...(query?.familyMemberId && { familyMemberId: query.familyMemberId }),
      },
      include: {
        scheduleTimes: true,
        familyMember: { select: { id: true, fullName: true, relation: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findToday(userId: string) {
    const today = new Date();
    const medicines = await this.prisma.medicine.findMany({
      where: {
        userId,
        isActive: true,
        startDate: { lte: today },
        OR: [{ endDate: null }, { endDate: { gte: today } }],
      },
      include: {
        scheduleTimes: true,
        logs: {
          where: {
            scheduledTime: {
              gte: startOfDay(today),
              lte: endOfDay(today),
            },
          },
        },
        familyMember: { select: { id: true, fullName: true } },
      },
    });

    return medicines;
  }

  async findOne(userId: string, id: string) {
    const med = await this.prisma.medicine.findFirst({
      where: { id, userId },
      include: {
        scheduleTimes: true,
        logs: { orderBy: { scheduledTime: 'desc' }, take: 20 },
        familyMember: true,
      },
    });
    if (!med) throw new NotFoundException('Medicine not found');
    return med;
  }

  async log(userId: string, medicineId: string, dto: LogMedicineDto) {
    const medicine = await this.findOne(userId, medicineId);

    const log = await this.prisma.medicineLog.create({
      data: {
        medicineId,
        scheduledTime: new Date(),
        takenAt: dto.status === 'TAKEN' ? new Date() : null,
        status: dto.status,
        notes: dto.notes,
      },
    });

    // Update stock count if taken
    if (dto.status === 'TAKEN' && medicine.stockCount !== null) {
      await this.prisma.medicine.update({
        where: { id: medicineId },
        data: { stockCount: Math.max(0, (medicine.stockCount || 0) - 1) },
      });
    }

    return log;
  }

  async getLogs(userId: string, medicineId: string) {
    await this.findOne(userId, medicineId); // check access
    return this.prisma.medicineLog.findMany({
      where: { medicineId },
      orderBy: { scheduledTime: 'desc' },
    });
  }
}
