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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const family_access_service_1 = require("../family/family-access.service");
const date_fns_1 = require("date-fns");
let DashboardService = class DashboardService {
    prisma;
    familyAccess;
    constructor(prisma, familyAccess) {
        this.prisma = prisma;
        this.familyAccess = familyAccess;
    }
    memberVisibilityWhere(ctx) {
        const or = [];
        if (ctx.isCaregiver)
            or.push({ ownerUserId: ctx.userId });
        if (ctx.linkedMemberIds.length)
            or.push({ id: { in: ctx.linkedMemberIds } });
        if (!or.length)
            or.push({ ownerUserId: ctx.userId });
        return { OR: or };
    }
    async getEmergencyOverview(userId) {
        const ctx = await this.familyAccess.getContext(userId);
        const memberWhere = this.memberVisibilityWhere(ctx);
        const medWhere = this.familyAccess.medicineVisibilityWhere(ctx);
        const healthWhere = this.familyAccess.healthVisibilityWhere(ctx);
        const members = await this.prisma.familyMember.findMany({
            where: memberWhere,
            orderBy: { createdAt: 'asc' },
        });
        const medicines = await this.prisma.medicine.findMany({
            where: { ...medWhere, isActive: true },
            include: { familyMember: { select: { fullName: true } } },
            take: 20,
        });
        const allergies = await this.prisma.healthRecord.findMany({
            where: { ...healthWhere, type: 'ALLERGY' },
            include: { familyMember: { select: { fullName: true } } },
            take: 10,
        });
        const emergencyContacts = ctx.isCaregiver
            ? await this.prisma.emergencyContact.findMany({
                where: { userId },
                take: 5,
            })
            : [];
        const prescriptions = ctx.isCaregiver
            ? await this.prisma.prescription.findMany({
                where: { userId },
                orderBy: { date: 'desc' },
                take: 3,
            })
            : [];
        return {
            members: members.map((m) => ({
                id: m.id,
                fullName: m.fullName,
                relation: m.relation,
                bloodGroup: m.bloodGroup !== 'UNKNOWN' ? m.bloodGroup : null,
                phone: m.phone,
                emergencyContact: m.emergencyContact,
            })),
            allergies: allergies.map((a) => ({
                title: a.title,
                notes: a.notes || a.diagnosis,
                for: a.familyMember?.fullName || 'Self',
            })),
            currentMedicines: medicines.map((m) => ({
                name: m.name,
                dosage: m.dosage,
                for: m.familyMember?.fullName || 'Self',
                doctor: m.doctorName,
            })),
            emergencyContacts,
            recentDoctors: prescriptions
                .filter((p) => p.doctorName)
                .map((p) => ({
                name: p.doctorName,
                hospital: p.hospitalName,
                for: p.familyMemberId
                    ? members.find((m) => m.id === p.familyMemberId)?.fullName
                    : 'Self',
            })),
        };
    }
    async getDashboard(userId) {
        const ctx = await this.familyAccess.getContext(userId);
        const medWhere = this.familyAccess.medicineVisibilityWhere(ctx);
        const today = new Date();
        const dayStart = (0, date_fns_1.startOfDay)(today);
        const monthStart = (0, date_fns_1.startOfMonth)(today);
        const monthEnd = (0, date_fns_1.endOfMonth)(today);
        const todayMedicines = await this.prisma.medicine.findMany({
            where: {
                ...medWhere,
                isActive: true,
                startDate: { lte: today },
                OR: [{ endDate: null }, { endDate: { gte: today } }],
            },
            include: {
                scheduleTimes: true,
                familyMember: { select: { fullName: true, id: true } },
                logs: {
                    where: {
                        scheduledTime: { gte: dayStart },
                    },
                },
            },
        });
        const todayDoses = todayMedicines.flatMap((med) => {
            const times = med.scheduleTimes.length
                ? med.scheduleTimes.map((t) => t.time)
                : ['09:00'];
            return times.map((time) => {
                const logged = med.logs.find((l) => (0, date_fns_1.format)(new Date(l.scheduledTime), 'HH:mm') === time);
                return {
                    medicineId: med.id,
                    name: med.name,
                    dosage: med.dosage,
                    time,
                    familyMember: med.familyMember,
                    doctorName: med.doctorName,
                    status: logged?.status || 'PENDING',
                };
            });
        });
        const pendingTasks = ctx.isCaregiver
            ? await this.prisma.task.findMany({
                where: {
                    userId,
                    status: { in: ['PENDING', 'IN_PROGRESS'] },
                },
                include: { familyMember: { select: { fullName: true } } },
                orderBy: { dueDate: 'asc' },
                take: 6,
            })
            : [];
        const upcomingDates = ctx.isCaregiver
            ? await this.prisma.importantDate.findMany({
                where: {
                    userId,
                    date: { gte: today },
                },
                orderBy: { date: 'asc' },
                take: 6,
            })
            : [];
        const transactions = ctx.isCaregiver
            ? await this.prisma.financeTransaction.findMany({
                where: {
                    userId,
                    date: { gte: monthStart, lte: monthEnd },
                },
            })
            : [];
        const income = transactions
            .filter((t) => t.type === 'INCOME')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const expense = transactions
            .filter((t) => t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0);
        const recentDocuments = ctx.isCaregiver
            ? await this.prisma.document.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 5,
                include: { familyMember: { select: { fullName: true } } },
            })
            : [];
        const families = await this.getFamiliesForUser(userId);
        const expiringDocs = ctx.isCaregiver
            ? await this.prisma.document.count({
                where: {
                    userId,
                    expiryDate: {
                        gte: today,
                        lte: new Date(today.getTime() + 1000 * 3600 * 24 * 45),
                    },
                },
            })
            : 0;
        const unreadNotifications = await this.prisma.notification.count({
            where: { userId, isRead: false },
        });
        const dueVaccines = await this.prisma.immunization.count({
            where: {
                ...(ctx.isCaregiver
                    ? { userId }
                    : { familyMemberId: { in: ctx.linkedMemberIds } }),
                administeredDate: null,
                scheduledDate: { lte: new Date(today.getTime() + 7 * 24 * 3600 * 1000) },
            },
        });
        const pendingDoseCount = todayDoses.filter((d) => d.status === 'PENDING').length;
        const aiSuggestions = [];
        if (pendingDoseCount > 0) {
            aiSuggestions.push(`${pendingDoseCount} medicine dose(s) due today — mark them in Medicine`);
        }
        if (dueVaccines > 0) {
            aiSuggestions.push(`${dueVaccines} vaccine(s) due this week — check Family Care`);
        }
        if (expiringDocs > 0) {
            aiSuggestions.push(`${expiringDocs} document(s) expiring soon — review Document Vault`);
        }
        if (pendingTasks.length > 0) {
            aiSuggestions.push(`${pendingTasks.length} task(s) waiting — open Tasks`);
        }
        if (!aiSuggestions.length) {
            aiSuggestions.push(ctx.isLinkedMember && !ctx.isCaregiver
                ? 'All clear today — your health reminders are up to date!'
                : 'All clear today — great job caring for your family!');
        }
        return {
            todayMedicines: todayMedicines.length,
            todayDoseCount: todayDoses.length,
            pendingDoseCount,
            medicinesList: todayMedicines,
            todayDoses,
            pendingTasks: pendingTasks.length,
            tasksList: pendingTasks,
            monthlySummary: {
                income,
                expense,
                net: income - expense,
                currency: 'BDT',
            },
            upcomingImportantDates: upcomingDates,
            recentDocuments,
            familyGroups: families,
            expiringDocumentsCount: expiringDocs,
            dueVaccinesCount: dueVaccines,
            unreadNotifications,
            aiSuggestions,
            isLinkedMember: ctx.isLinkedMember && !ctx.isCaregiver,
        };
    }
    async getFamiliesForUser(userId) {
        const owned = await this.prisma.familyGroup.findMany({
            where: { ownerId: userId },
            include: { members: { take: 8 } },
        });
        const linked = await this.prisma.familyMember.findMany({
            where: { linkedUserId: userId },
            select: { familyGroupId: true },
        });
        const ownedIds = new Set(owned.map((f) => f.id));
        const extraIds = linked.map((m) => m.familyGroupId).filter((id) => !ownedIds.has(id));
        const linkedFamilies = extraIds.length
            ? await this.prisma.familyGroup.findMany({
                where: { id: { in: extraIds } },
                include: { members: { take: 8 } },
            })
            : [];
        return [...owned, ...linkedFamilies];
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        family_access_service_1.FamilyAccessService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map