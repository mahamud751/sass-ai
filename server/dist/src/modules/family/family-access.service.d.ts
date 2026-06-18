import { PrismaService } from '../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export type FamilyAccessContext = {
    userId: string;
    isCaregiver: boolean;
    isLinkedMember: boolean;
    linkedMemberIds: string[];
    caregiverUserIds: string[];
};
export declare class FamilyAccessService {
    private prisma;
    constructor(prisma: PrismaService);
    getContext(userId: string): Promise<FamilyAccessContext>;
    medicineVisibilityWhere(ctx: FamilyAccessContext): Prisma.MedicineWhereInput;
    healthVisibilityWhere(ctx: FamilyAccessContext): Prisma.HealthRecordWhereInput;
    canAccessFamilyGroup(userId: string, familyId: string): Promise<boolean>;
    canAccessMember(userId: string, memberId: string): Promise<boolean>;
}
