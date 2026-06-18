import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from '../family/family-access.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';

@Injectable()
export class HealthService {
  constructor(
    private prisma: PrismaService,
    private familyAccess: FamilyAccessService,
  ) {}

  async create(userId: string, dto: CreateHealthRecordDto) {
    if (dto.familyMemberId) {
      const member = await this.prisma.familyMember.findFirst({
        where: { id: dto.familyMemberId, ownerUserId: userId },
      });
      if (!member) {
        throw new ForbiddenException('Invalid family member');
      }
    }

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
    const ctx = await this.familyAccess.getContext(userId);
    return this.prisma.healthRecord.findMany({
      where: {
        ...this.familyAccess.healthVisibilityWhere(ctx),
        ...(memberId && { familyMemberId: memberId }),
      },
      orderBy: { date: 'desc' },
      include: { familyMember: { select: { fullName: true } } },
    });
  }

  async findByMember(userId: string, memberId: string) {
    return this.findAll(userId, memberId);
  }
}
