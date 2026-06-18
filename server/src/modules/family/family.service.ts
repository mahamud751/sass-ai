import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from './family-access.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';

const memberInclude = {
  linkedUser: { select: { id: true, email: true, fullName: true } },
};

@Injectable()
export class FamilyService {
  constructor(
    private prisma: PrismaService,
    private familyAccess: FamilyAccessService,
  ) {}

  async createFamily(userId: string, dto: CreateFamilyDto) {
    return this.prisma.familyGroup.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      },
      include: { members: { include: memberInclude } },
    });
  }

  async getFamilies(userId: string) {
    const owned = await this.prisma.familyGroup.findMany({
      where: { ownerId: userId },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
          include: memberInclude,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const linkedMemberships = await this.prisma.familyMember.findMany({
      where: { linkedUserId: userId },
      select: { familyGroupId: true },
    });
    const ownedIds = new Set(owned.map((f) => f.id));
    const linkedFamilyIds = linkedMemberships
      .map((m) => m.familyGroupId)
      .filter((id) => !ownedIds.has(id));

    if (!linkedFamilyIds.length) return owned;

    const linkedFamilies = await this.prisma.familyGroup.findMany({
      where: { id: { in: linkedFamilyIds } },
      include: {
        members: {
          orderBy: { createdAt: 'asc' },
          include: memberInclude,
        },
      },
    });

    return [...owned, ...linkedFamilies];
  }

  async getFamilyById(userId: string, familyId: string) {
    const canAccess = await this.familyAccess.canAccessFamilyGroup(userId, familyId);
    if (!canAccess) throw new NotFoundException('Family not found');

    const family = await this.prisma.familyGroup.findFirst({
      where: { id: familyId },
      include: { members: { include: memberInclude } },
    });
    if (!family) throw new NotFoundException('Family not found');
    return family;
  }

  async addMember(userId: string, familyId: string, dto: CreateFamilyMemberDto) {
    const family = await this.prisma.familyGroup.findFirst({
      where: { id: familyId, ownerId: userId },
    });
    if (!family) throw new ForbiddenException('Not your family group');

    let linkedUserId: string | null = null;
    const loginEmail = (dto.loginEmail || dto.email)?.toLowerCase();

    if (dto.createLogin) {
      if (!loginEmail || !dto.password) {
        throw new BadRequestException('Email and password are required to create a login');
      }
      const existing = await this.prisma.user.findUnique({
        where: { email: loginEmail },
      });
      if (existing) throw new ConflictException('Email already registered');

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const linkedUser = await this.prisma.user.create({
        data: {
          email: loginEmail,
          password: hashedPassword,
          fullName: dto.fullName,
          phone: dto.phone,
        },
      });
      linkedUserId = linkedUser.id;
    }

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
        email: loginEmail || dto.email,
        address: dto.address,
        emergencyContact: dto.emergencyContact,
        notes: dto.notes,
        linkedUserId,
      },
      include: memberInclude,
    });
  }

  async getMembers(userId: string, familyId: string) {
    const canAccess = await this.familyAccess.canAccessFamilyGroup(userId, familyId);
    if (!canAccess) throw new ForbiddenException('Access denied');

    return this.prisma.familyMember.findMany({
      where: { familyGroupId: familyId },
      include: memberInclude,
      orderBy: { createdAt: 'asc' },
    });
  }

  async getMemberDetails(userId: string, memberId: string) {
    const canAccess = await this.familyAccess.canAccessMember(userId, memberId);
    if (!canAccess) throw new NotFoundException('Family member not found');

    const member = await this.prisma.familyMember.findFirst({
      where: { id: memberId },
      include: {
        familyGroup: true,
        linkedUser: { select: { id: true, email: true, fullName: true } },
      },
    });
    if (!member) throw new NotFoundException('Family member not found');
    return member;
  }
}
