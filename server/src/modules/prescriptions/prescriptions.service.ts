import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { addDays } from 'date-fns';

@Injectable()
export class PrescriptionsService {
  constructor(private prisma: PrismaService) {}

  private async verifyFamilyMember(userId: string, familyMemberId?: string) {
    if (!familyMemberId) return;
    const member = await this.prisma.familyMember.findFirst({
      where: { id: familyMemberId, ownerUserId: userId },
    });
    if (!member) throw new ForbiddenException('Invalid family member');
  }

  async create(userId: string, dto: CreatePrescriptionDto) {
    await this.verifyFamilyMember(userId, dto.familyMemberId);

    const prescription = await this.prisma.prescription.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId || null,
        doctorName: dto.doctorName,
        hospitalName: dto.hospitalName,
        date: new Date(dto.date),
        notes: dto.notes,
        healthRecordId: dto.healthRecordId || null,
        fileId: dto.fileId || null,
        items: {
          create: dto.items.map((item) => ({
            medicineName: item.medicineName,
            dosage: item.dosage,
            frequency: item.frequency || 'DAILY',
            times: item.times?.length ? item.times : ['09:00', '21:00'],
            instruction: item.instruction || 'AFTER_MEAL',
            durationDays: item.durationDays,
            notes: item.notes,
          })),
        },
      },
      include: this.includeRelations(),
    });

    return prescription;
  }

  async findAll(userId: string, familyMemberId?: string) {
    return this.prisma.prescription.findMany({
      where: {
        userId,
        ...(familyMemberId && { familyMemberId }),
      },
      include: this.includeRelations(),
      orderBy: { date: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const rx = await this.prisma.prescription.findFirst({
      where: { id, userId },
      include: this.includeRelations(),
    });
    if (!rx) throw new NotFoundException('Prescription not found');
    return rx;
  }

  async autoAddMedicines(userId: string, prescriptionId: string) {
    const prescription = await this.findOne(userId, prescriptionId);
    const pending = prescription.items.filter((i) => !i.medicineId);

    if (pending.length === 0) {
      throw new BadRequestException('All medicines already added from this prescription');
    }

    const created: Awaited<ReturnType<typeof this.createMedicineFromItem>>[] = [];
    for (const item of pending) {
      const medicine = await this.createMedicineFromItem(userId, prescription, item);
      if (medicine) created.push(medicine);
    }

    return {
      prescriptionId,
      addedCount: created.length,
      medicines: created,
    };
  }

  async addMedicineFromItem(userId: string, prescriptionId: string, itemId: string) {
    const prescription = await this.findOne(userId, prescriptionId);
    const item = prescription.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Prescription item not found');
    if (item.medicineId) {
      throw new BadRequestException('Medicine already created for this item');
    }

    const medicine = await this.createMedicineFromItem(userId, prescription, item);
    return medicine;
  }

  private async createMedicineFromItem(
    userId: string,
    prescription: Awaited<ReturnType<typeof this.findOne>>,
    item: (typeof prescription.items)[number],
  ) {
    const startDate = prescription.date;
    const endDate = item.durationDays
      ? addDays(new Date(startDate), item.durationDays)
      : null;

    const medicine = await this.prisma.medicine.create({
      data: {
        userId,
        familyMemberId: prescription.familyMemberId,
        doctorName: prescription.doctorName,
        name: item.medicineName,
        dosage: item.dosage,
        instruction: item.instruction,
        startDate: new Date(startDate),
        endDate,
        frequency: item.frequency,
        notes: item.notes,
      },
    });

    if (item.times.length > 0) {
      await this.prisma.medicineScheduleTime.createMany({
        data: item.times.map((time) => ({ medicineId: medicine.id, time })),
      });
    }

    await this.prisma.prescriptionItem.update({
      where: { id: item.id },
      data: { medicineId: medicine.id },
    });

    return this.prisma.medicine.findFirst({
      where: { id: medicine.id },
      include: {
        scheduleTimes: true,
        familyMember: { select: { id: true, fullName: true } },
      },
    });
  }

  private includeRelations() {
    return {
      familyMember: { select: { id: true, fullName: true, relation: true } },
      items: {
        include: {
          medicine: {
            select: { id: true, name: true, dosage: true, isActive: true },
          },
        },
      },
    };
  }
}