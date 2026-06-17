import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';

@Injectable()
export class FamilyService {
  constructor(private prisma: PrismaService) {}

  async createFamily(userId: string, dto: CreateFamilyDto) {
    return this.prisma.familyGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      },
      include: { members: true },
    });
  }

  async getFamilies(userId: string) {
    return this.prisma.familyGroup.findMany({
      where: { ownerId: userId },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getFamilyById(userId: string, familyId: string) {
    const family = await this.prisma.familyGroup.findFirst({
      where: { id: familyId, ownerId: userId },
      include: { members: true },
    });
    if (!family) throw new NotFoundException('Family not found');
    return family;
  }

  async addMember(userId: string, familyId: string, dto: CreateFamilyMemberDto) {
    // Verify ownership
    const family = await this.prisma.familyGroup.findFirst({
      where: { id: familyId, ownerId: userId },
    });
    if (!family) throw new ForbiddenException('Not your family group');

    return this.prisma.familyMember.create({
      data: {
        familyGroupId: familyId,
        ownerUserId: userId,
        fullName: dto.fullName,
        relation: dto.relation,
        gender: dto.gender || 'UNKNOWN',
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : null,
        bloodGroup: dto.bloodGroup || 'UNKNOWN',
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        notes: dto.notes,
      },
    });
  }

  async getMembers(userId: string, familyId: string) {
    const family = await this.prisma.familyGroup.findFirst({
      where: { id: familyId, ownerId: userId },
    });
    if (!family) throw new ForbiddenException('Access denied');

    return this.prisma.familyMember.findMany({
      where: { familyGroupId: familyId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMemberDetails(userId: string, memberId: string) {
    const member = await this.prisma.familyMember.findFirst({
      where: {
        id: memberId,
        ownerUserId: userId,
      },
      include: {
        familyGroup: true,
      },
    });
    if (!member) throw new NotFoundException('Family member not found');
    return member;
  }
}
