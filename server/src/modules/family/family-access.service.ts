import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export type FamilyAccessContext = {
  userId: string;
  isCaregiver: boolean;
  isLinkedMember: boolean;
  linkedMemberIds: string[];
  caregiverUserIds: string[];
};

@Injectable()
export class FamilyAccessService {
  constructor(private prisma: PrismaService) {}

  async getContext(userId: string): Promise<FamilyAccessContext> {
    const linkedMembers = await this.prisma.familyMember.findMany({
      where: { linkedUserId: userId },
      select: { id: true, ownerUserId: true },
    });

    const ownedFamilyCount = await this.prisma.familyGroup.count({
      where: { ownerId: userId },
    });

    return {
      userId,
      isCaregiver: ownedFamilyCount > 0,
      isLinkedMember: linkedMembers.length > 0,
      linkedMemberIds: linkedMembers.map((m) => m.id),
      caregiverUserIds: [...new Set(linkedMembers.map((m) => m.ownerUserId))],
    };
  }

  /** Medicines visible to this user (caregiver = all family meds, member = own only) */
  medicineVisibilityWhere(ctx: FamilyAccessContext): Prisma.MedicineWhereInput {
    const or: Prisma.MedicineWhereInput[] = [];
    if (ctx.isCaregiver) {
      or.push({ userId: ctx.userId });
    }
    if (ctx.linkedMemberIds.length) {
      or.push({ familyMemberId: { in: ctx.linkedMemberIds } });
    }
    if (!or.length) {
      or.push({ userId: ctx.userId });
    }
    return { OR: or };
  }

  healthVisibilityWhere(ctx: FamilyAccessContext): Prisma.HealthRecordWhereInput {
    const or: Prisma.HealthRecordWhereInput[] = [];
    if (ctx.isCaregiver) {
      or.push({ userId: ctx.userId });
    }
    if (ctx.linkedMemberIds.length) {
      or.push({ familyMemberId: { in: ctx.linkedMemberIds } });
    }
    if (!or.length) {
      or.push({ userId: ctx.userId });
    }
    return { OR: or };
  }

  async canAccessFamilyGroup(userId: string, familyId: string): Promise<boolean> {
    const owner = await this.prisma.familyGroup.findFirst({
      where: { id: familyId, ownerId: userId },
    });
    if (owner) return true;
    const linked = await this.prisma.familyMember.findFirst({
      where: { familyGroupId: familyId, linkedUserId: userId },
    });
    return !!linked;
  }

  async canAccessMember(userId: string, memberId: string): Promise<boolean> {
    const member = await this.prisma.familyMember.findFirst({
      where: {
        id: memberId,
        OR: [{ ownerUserId: userId }, { linkedUserId: userId }],
      },
    });
    return !!member;
  }
}
