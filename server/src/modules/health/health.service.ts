import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateHealthRecordDto) {
    return this.prisma.healthRecord.create({
      data: {
        userId,
        familyMemberId: dto.familyMemberId || null,
        type: dto.type,
        title: dto.title,
        doctorName: dto.doctorName,
        hospitalName: dto.hospitalName,
        date: new Date(dto.date),
        diagnosis: dto.diagnosis,
        notes: dto.notes,
      },
    });
  }

  async findAll(userId: string, memberId?: string) {
    return this.prisma.healthRecord.findMany({
      where: { userId, ...(memberId && { familyMemberId: memberId }) },
      orderBy: { date: 'desc' },
      include: { familyMember: { select: { fullName: true } } },
    });
  }

  async findByMember(userId: string, memberId: string) {
    return this.findAll(userId, memberId);
  }
}
