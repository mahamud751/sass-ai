import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateImmunizationDto } from './dto/create-immunization.dto';

@Injectable()
export class ImmunizationsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateImmunizationDto) {
    return this.prisma.immunization.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId,
        vaccineName: dto.vaccineName,
        scheduledDate: new Date(dto.scheduledDate),
        administeredDate: dto.administeredDate ? new Date(dto.administeredDate) : null,
        dose: dto.dose || 1,
        batchNumber: dto.batchNumber,
        location: dto.location,
        notes: dto.notes,
        documentId: dto.documentId,
      },
      include: { familyMember: { select: { fullName: true } } },
    });
  }

  async findAll(userId: string, familyMemberId?: string) {
    const where: any = { userId };
    if (familyMemberId) where.familyMemberId = familyMemberId;
    return this.prisma.immunization.findMany({
      where,
      orderBy: { scheduledDate: 'asc' },
      include: { familyMember: { select: { id: true, fullName: true } } },
    });
  }

  async getDue(userId: string) {
    const today = new Date();
    return this.prisma.immunization.findMany({
      where: {
        userId,
        administeredDate: null,
        scheduledDate: { lte: today },
      },
      include: { familyMember: { select: { fullName: true } } },
      orderBy: { scheduledDate: 'asc' },
    });
  }

  async markGiven(userId: string, id: string, body: { administeredDate?: string; notes?: string }) {
    const imm = await this.prisma.immunization.findFirst({ where: { id, userId } });
    if (!imm) throw new NotFoundException();
    return this.prisma.immunization.update({
      where: { id },
      data: {
        administeredDate: body.administeredDate ? new Date(body.administeredDate) : new Date(),
        notes: body.notes ? `${imm.notes || ''} ${body.notes}`.trim() : imm.notes,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.prisma.immunization.deleteMany({ where: { id, userId } });
    return { success: true };
  }

  // Simple suggested schedule generator (client can call + customize)
  getStandardSchedule(birthDate: Date) {
    const b = new Date(birthDate);
    const addWeeks = (w: number) => new Date(b.getTime() + w * 7 * 86400000);
    return [
      { vaccineName: 'BCG + Hep B (birth dose)', scheduled: b, dose: 1 },
      { vaccineName: 'Polio-1 + DPT-1 + Hib-1 + Hep B-2', scheduled: addWeeks(6), dose: 1 },
      { vaccineName: 'Polio-2 + DPT-2 + Hib-2', scheduled: addWeeks(10), dose: 2 },
      { vaccineName: 'Polio-3 + DPT-3 + Hib-3 + Hep B-3', scheduled: addWeeks(14), dose: 3 },
      { vaccineName: 'Measles + Rubella (MR-1)', scheduled: addWeeks(36), dose: 1 },
      { vaccineName: 'Polio Booster + DPT Booster', scheduled: addWeeks(72), dose: 1 },
    ];
  }
}
