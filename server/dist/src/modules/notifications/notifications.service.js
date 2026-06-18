"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const prisma_service_1 = require("../../prisma/prisma.service");
const family_access_service_1 = require("../family/family-access.service");
const date_fns_1 = require("date-fns");
let NotificationsService = NotificationsService_1 = class NotificationsService {
    prisma;
    familyAccess;
    logger = new common_1.Logger(NotificationsService_1.name);
    constructor(prisma, familyAccess) {
        this.prisma = prisma;
        this.familyAccess = familyAccess;
    }
    async findAll(userId, unreadOnly = false) {
        return this.prisma.notification.findMany({
            where: {
                userId,
                ...(unreadOnly ? { isRead: false } : {}),
            },
            orderBy: { createdAt: 'desc' },
            take: 50,
        });
    }
    async getUnreadCount(userId) {
        const count = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        return { count };
    }
    async markRead(userId, id) {
        const n = await this.prisma.notification.findFirst({ where: { id, userId } });
        if (!n)
            return null;
        return this.prisma.notification.update({
            where: { id },
            data: { isRead: true, readAt: new Date() },
        });
    }
    async markAllRead(userId) {
        await this.prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true, readAt: new Date() },
        });
        return { success: true };
    }
    async create(userId, type, title, message, data) {
        return this.prisma.notification.create({
            data: {
                userId,
                type,
                title,
                message,
                data: data,
            },
        });
    }
    normalizeTime(time) {
        const [hRaw, mRaw] = time.split(':');
        const h = parseInt(hRaw, 10);
        const m = parseInt(mRaw || '0', 10);
        if (Number.isNaN(h))
            return '09:00';
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    }
    async hasRecentDuplicate(userId, type, key, hours = 1) {
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
    getReminderRecipients(med) {
        const recipients = new Set([med.userId]);
        if (med.familyMember?.linkedUserId) {
            recipients.add(med.familyMember.linkedUserId);
        }
        return [...recipients];
    }
    async notifyMedicineDue(med, time, today) {
        const key = `med-${med.id}-${time}-${(0, date_fns_1.format)(today, 'yyyy-MM-dd')}`;
        const who = med.familyMember?.fullName || 'You';
        const title = `Medicine due: ${med.name}`;
        const message = `${who} — ${med.dosage} at ${time}`;
        for (const uid of this.getReminderRecipients(med)) {
            const duplicate = await this.hasRecentDuplicate(uid, 'MEDICINE_REMINDER', key);
            if (duplicate)
                continue;
            await this.create(uid, 'MEDICINE_REMINDER', title, message, {
                key,
                medicineId: med.id,
                scheduledTime: time,
                url: '/medicine',
            });
        }
    }
    isDoseTakenToday(logs, time) {
        return logs.some((log) => {
            const logTime = this.normalizeTime((0, date_fns_1.format)(new Date(log.scheduledTime), 'HH:mm'));
            return logTime === time && log.status === 'TAKEN';
        });
    }
    async syncMedicineRemindersForUser(userId) {
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
                        scheduledTime: { gte: (0, date_fns_1.startOfDay)(now), lte: (0, date_fns_1.endOfDay)(now) },
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
                if (delta < -30 || delta > 60)
                    continue;
                if (this.isDoseTakenToday(med.logs, time))
                    continue;
                const key = `med-${med.id}-${time}-${(0, date_fns_1.format)(now, 'yyyy-MM-dd')}`;
                const duplicate = await this.hasRecentDuplicate(userId, 'MEDICINE_REMINDER', key);
                if (duplicate)
                    continue;
                await this.notifyMedicineDue(med, time, now);
                created++;
            }
        }
        return { synced: true, created };
    }
    async generateMedicineReminders() {
        const now = new Date();
        const currentTime = this.normalizeTime((0, date_fns_1.format)(now, 'HH:mm'));
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
                        scheduledTime: { gte: (0, date_fns_1.startOfDay)(now), lte: (0, date_fns_1.endOfDay)(now) },
                    },
                },
            },
        });
        for (const med of medicines) {
            const times = med.scheduleTimes.length
                ? med.scheduleTimes.map((t) => this.normalizeTime(t.time))
                : ['09:00'];
            for (const time of times) {
                if (time !== currentTime)
                    continue;
                if (this.isDoseTakenToday(med.logs, time))
                    continue;
                await this.notifyMedicineDue(med, time, now);
            }
        }
    }
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
            if (medCount === 0)
                continue;
            const key = `daily-summary-${user.id}-${(0, date_fns_1.format)(today, 'yyyy-MM-dd')}`;
            const duplicate = await this.hasRecentDuplicate(user.id, 'GENERAL', key, 20);
            if (duplicate)
                continue;
            await this.create(user.id, 'GENERAL', 'Good morning — health reminders today', `You have ${medCount} active medicine reminder(s) today. Open Medicine to mark them taken.`, { key, url: '/medicine' });
        }
    }
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
            const duplicate = await this.hasRecentDuplicate(doc.userId, 'DOCUMENT_EXPIRY', key, 24 * 7);
            if (duplicate)
                continue;
            await this.create(doc.userId, 'DOCUMENT_EXPIRY', `Document expiring soon: ${doc.title}`, `Expires ${doc.expiryDate ? (0, date_fns_1.format)(new Date(doc.expiryDate), 'MMM d, yyyy') : 'soon'}`, { key, documentId: doc.id, url: '/documents' });
        }
    }
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
            const recipients = new Set([v.userId]);
            if (v.familyMember?.linkedUserId) {
                recipients.add(v.familyMember.linkedUserId);
            }
            for (const uid of recipients) {
                const duplicate = await this.hasRecentDuplicate(uid, 'TASK_REMINDER', key, 24 * 3);
                if (duplicate)
                    continue;
                await this.create(uid, 'TASK_REMINDER', `Vaccine due: ${v.vaccineName}`, `${v.familyMember.fullName} — due ${(0, date_fns_1.format)(new Date(v.scheduledDate), 'MMM d')}`, { key, immunizationId: v.id, url: '/family' });
            }
        }
    }
};
exports.NotificationsService = NotificationsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "generateMedicineReminders", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_8AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "generateDailyFamilySummary", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_9AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "generateDocumentExpiryReminders", null);
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_10AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], NotificationsService.prototype, "generateVaccineDueReminders", null);
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_access_service_1.FamilyAccessService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map