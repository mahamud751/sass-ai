import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { FamilyAccessService } from '../family/family-access.service';
import { NotificationType, Prisma } from '@prisma/client';
import { format, startOfDay, endOfDay } from 'date-fns';

type MedicineWithRelations = {
  id: string;
  name: string;
  dosage: string;
  userId: string;
  scheduleTimes: { time: string }[];
  familyMember: { fullName: string; linkedUserId: string | null } | null;
  logs: { scheduledTime: Date; status: string }[];
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private familyAccess: FamilyAccessService,
  ) {}

  async findAll(userId: string, unreadOnly = false) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(unreadOnly ? { isRead: false } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markRead(userId: string, id: string) {
    const n = await this.prisma.notification.findFirst({ where: { id, userId } });
    if (!n) return null;
    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markAllRead(userId: string) {
    await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return { success: true };
  }

  async create(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, unknown>,
  ) {
    return this.prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        data: data as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private normalizeTime(time: string): string {
    const [hRaw, mRaw] = time.split(':');
    const h = parseInt(hRaw, 10);
    const m = parseInt(mRaw || '0', 10);
    if (Number.isNaN(h)) return '09:00';
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  }

  private async hasRecentDuplicate(
    userId: string,
    type: NotificationType,
    key: string,
    hours = 1,
  ) {
    const since = new Date(Date.now() - hours * 3600 * 1000);
    const existing = await this.prisma.notification.findFirst({
      where: {
        userId,
        type,
        createdAt: { gte: since },
        data: { path: ['key'], equals: key },
      },
    });
    return !!existing;
  }

  private getReminderRecipients(med: MedicineWithRelations): string[] {
    const recipients = new Set<string>([med.userId]);
    if (med.familyMember?.linkedUserId) {
      recipients.add(med.familyMember.linkedUserId);
    }
    return [...recipients];
  }

  private async notifyMedicineDue(med: MedicineWithRelations, time: string, today: Date) {
    const key = `med-${med.id}-${time}-${format(today, 'yyyy-MM-dd')}`;
    const who = med.familyMember?.fullName || 'You';
    const title = `Medicine due: ${med.name}`;
    const message = `${who} — ${med.dosage} at ${time}`;

    for (const uid of this.getReminderRecipients(med)) {
      const duplicate = await this.hasRecentDuplicate(uid, 'MEDICINE_REMINDER', key);
      if (duplicate) continue;
      await this.create(uid, 'MEDICINE_REMINDER', title, message, {
        key,
        medicineId: med.id,
        scheduledTime: time,
        url: '/medicine',
      });
    }
  }

  private isDoseTakenToday(
    logs: { scheduledTime: Date; status: string }[],
    time: string,
  ) {
    return logs.some((log) => {
      const logTime = this.normalizeTime(format(new Date(log.scheduledTime), 'HH:mm'));
      return logTime === time && log.status === 'TAKEN';
    });
  }

  /** Sync pending medicine reminders when user opens the app (wider time window than cron) */
  async syncMedicineRemindersForUser(userId: string) {
    const ctx = await this.familyAccess.getContext(userId);
    const visibility = this.familyAccess.medicineVisibilityWhere(ctx);
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    let created = 0;

    const medicines = await this.prisma.medicine.findMany({
      where: {
        ...visibility,
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        scheduleTimes: true,
        familyMember: { select: { fullName: true, linkedUserId: true } },
        logs: {
          where: {
            scheduledTime: { gte: startOfDay(now), lte: endOfDay(now) },
          },
        },
      },
    });

    for (const med of medicines) {
      const times = med.scheduleTimes.length
        ? med.scheduleTimes.map((t) => this.normalizeTime(t.time))
        : ['09:00'];

      for (const time of times) {
        const [h, m] = time.split(':').map(Number);
        const slotMinutes = h * 60 + m;
        const delta = currentMinutes - slotMinutes;
        if (delta < -30 || delta > 60) continue;
        if (this.isDoseTakenToday(med.logs, time)) continue;

        const key = `med-${med.id}-${time}-${format(now, 'yyyy-MM-dd')}`;
        const duplicate = await this.hasRecentDuplicate(userId, 'MEDICINE_REMINDER', key);
        if (duplicate) continue;

        await this.notifyMedicineDue(med, time, now);
        created++;
      }
    }

    return { synced: true, created };
  }

  @Cron(CronExpression.EVERY_MINUTE)
  async generateMedicineReminders() {
    const now = new Date();
    const currentTime = this.normalizeTime(format(now, 'HH:mm'));

    const medicines = await this.prisma.medicine.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
      },
      include: {
        scheduleTimes: true,
        familyMember: { select: { fullName: true, linkedUserId: true } },
        logs: {
          where: {
            scheduledTime: { gte: startOfDay(now), lte: endOfDay(now) },
          },
        },
      },
    });

    for (const med of medicines) {
      const times = med.scheduleTimes.length
        ? med.scheduleTimes.map((t) => this.normalizeTime(t.time))
        : ['09:00'];

      for (const time of times) {
        if (time !== currentTime) continue;
        if (this.isDoseTakenToday(med.logs, time)) continue;
        await this.notifyMedicineDue(med, time, now);
      }
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_8AM)
  async generateDailyFamilySummary() {
    const today = new Date();
    const users = await this.prisma.user.findMany({ select: { id: true } });

    for (const user of users) {
      const ctx = await this.familyAccess.getContext(user.id);
      const medCount = await this.prisma.medicine.count({
        where: {
          ...this.familyAccess.medicineVisibilityWhere(ctx),
          isActive: true,
          startDate: { lte: today },
          OR: [{ endDate: null }, { endDate: { gte: today } }],
        },
      });

      if (medCount === 0) continue;

      const key = `daily-summary-${user.id}-${format(today, 'yyyy-MM-dd')}`;
      const duplicate = await this.hasRecentDuplicate(user.id, 'GENERAL', key, 20);
      if (duplicate) continue;

      await this.create(
        user.id,
        'GENERAL',
        'Good morning — health reminders today',
        `You have ${medCount} active medicine reminder(s) today. Open Medicine to mark them taken.`,
        { key, url: '/medicine' },
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async generateDocumentExpiryReminders() {
    const today = new Date();
    const soon = new Date(today.getTime() + 45 * 24 * 3600 * 1000);

    const docs = await this.prisma.document.findMany({
      where: {
        expiryDate: { gte: today, lte: soon },
      },
    });

    for (const doc of docs) {
      const key = `doc-expiry-${doc.id}`;
      const duplicate = await this.hasRecentDuplicate(
        doc.userId,
        'DOCUMENT_EXPIRY',
        key,
        24 * 7,
      );
      if (duplicate) continue;

      await this.create(
        doc.userId,
        'DOCUMENT_EXPIRY',
        `Document expiring soon: ${doc.title}`,
        `Expires ${doc.expiryDate ? format(new Date(doc.expiryDate), 'MMM d, yyyy') : 'soon'}`,
        { key, documentId: doc.id, url: '/documents' },
      );
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_10AM)
  async generateVaccineDueReminders() {
    const horizon = new Date(Date.now() + 7 * 24 * 3600 * 1000);
    const due = await this.prisma.immunization.findMany({
      where: {
        administeredDate: null,
        scheduledDate: { lte: horizon },
      },
      include: {
        familyMember: { select: { fullName: true, linkedUserId: true } },
      },
    });

    for (const v of due) {
      const key = `vaccine-${v.id}`;
      const recipients = new Set<string>([v.userId]);
      if (v.familyMember?.linkedUserId) {
        recipients.add(v.familyMember.linkedUserId);
      }

      for (const uid of recipients) {
        const duplicate = await this.hasRecentDuplicate(uid, 'TASK_REMINDER', key, 24 * 3);
        if (duplicate) continue;

        await this.create(
          uid,
          'TASK_REMINDER',
          `Vaccine due: ${v.vaccineName}`,
          `${v.familyMember.fullName} — due ${format(new Date(v.scheduledDate), 'MMM d')}`,
          { key, immunizationId: v.id, url: '/family' },
        );
      }
    }
  }
}
