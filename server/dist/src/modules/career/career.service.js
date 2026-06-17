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
exports.CareerService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let CareerService = class CareerService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createGoal(userId, dto) {
        return this.prisma.careerGoal.create({
            data: {
                userId,
                familyMemberId: dto.familyMemberId || null,
                targetRole: dto.targetRole,
                targetCompany: dto.targetCompany,
                salaryGoal: dto.salaryGoal,
                skills: dto.skills || [],
                currentSkills: dto.currentSkills || [],
                targetDate: dto.targetDate ? new Date(dto.targetDate) : null,
                notes: dto.notes,
            },
        });
    }
    async getGoals(userId) {
        return this.prisma.careerGoal.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                jobApplications: true,
                familyMember: { select: { id: true, fullName: true } }
            },
        });
    }
    async updateGoal(userId, id, dto) {
        const goal = await this.findGoal(userId, id);
        return this.prisma.careerGoal.update({
            where: { id: goal.id },
            data: {
                targetRole: dto.targetRole,
                targetCompany: dto.targetCompany,
                salaryGoal: dto.salaryGoal,
                familyMemberId: dto.familyMemberId,
                skills: dto.skills,
                currentSkills: dto.currentSkills,
                targetDate: dto.targetDate ? new Date(dto.targetDate) : undefined,
                notes: dto.notes,
                roadmap: dto.roadmap,
            },
        });
    }
    async deleteGoal(userId, id) {
        await this.findGoal(userId, id);
        return this.prisma.careerGoal.delete({ where: { id } });
    }
    async findGoal(userId, id) {
        const g = await this.prisma.careerGoal.findFirst({ where: { id, userId } });
        if (!g)
            throw new common_1.NotFoundException('Career goal not found');
        return g;
    }
    async createApplication(userId, dto) {
        return this.prisma.jobApplication.create({
            data: {
                userId,
                careerGoalId: dto.careerGoalId,
                company: dto.company,
                role: dto.role,
                status: dto.status || 'APPLIED',
                appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : new Date(),
                interviewDate: dto.interviewDate ? new Date(dto.interviewDate) : null,
                salaryOffered: dto.salaryOffered,
                notes: dto.notes,
                jobUrl: dto.jobUrl,
                resumeFileId: dto.resumeFileId,
            },
        });
    }
    async getApplications(userId, goalId) {
        const where = { userId };
        if (goalId)
            where.careerGoalId = goalId;
        return this.prisma.jobApplication.findMany({ where, orderBy: { appliedDate: 'desc' } });
    }
    async updateApplicationStatus(userId, id, status, interviewDate) {
        const app = await this.prisma.jobApplication.findFirst({ where: { id, userId } });
        if (!app)
            throw new common_1.NotFoundException();
        return this.prisma.jobApplication.update({
            where: { id },
            data: {
                status: status,
                interviewDate: interviewDate ? new Date(interviewDate) : undefined,
            },
        });
    }
    async generateRoadmap(userId, goalId) {
        const goal = await this.findGoal(userId, goalId);
        const steps = [
            { step: `Master core skills for ${goal.targetRole}`, done: false, dueInDays: 30, description: `Focus on: ${goal.skills?.slice(0, 3).join(', ') || 'key technologies'}` },
            { step: 'Build portfolio projects', done: false, dueInDays: 60 },
            { step: `Update CV and LinkedIn for ${goal.targetRole}`, done: false, dueInDays: 15 },
            { step: 'Apply to 5-10 target companies', done: false, dueInDays: 90 },
            { step: 'Practice interviews', done: false, dueInDays: 45 },
        ];
        const roadmap = { steps, generatedAt: new Date().toISOString(), targetRole: goal.targetRole };
        return this.prisma.careerGoal.update({
            where: { id: goalId },
            data: { roadmap: roadmap },
        });
    }
    async analyzeSkills(userId, goalId) {
        const goal = await this.findGoal(userId, goalId);
        const current = goal.currentSkills || [];
        const target = goal.skills || [];
        const gaps = target.filter(s => !current.some(c => c.toLowerCase().includes(s.toLowerCase()) || s.toLowerCase().includes(c.toLowerCase())));
        const match = target.length > 0 ? Math.round(((target.length - gaps.length) / target.length) * 100) : 50;
        return {
            currentSkills: current,
            targetSkills: target,
            matchPercentage: match,
            gaps,
            suggestions: gaps.length ? [`Focus on ${gaps[0]}`, 'Build projects using gaps'] : ['Strong match! Start applying.'],
        };
    }
    async generateCV(userId, goalId, extraData) {
        const goal = await this.findGoal(userId, goalId);
        return {
            summary: `Experienced professional targeting ${goal.targetRole} at ${goal.targetCompany || 'leading companies'}.`,
            skills: goal.skills || [],
            targetRole: goal.targetRole,
            experience: extraData?.experience || 'Add your experience here',
            education: extraData?.education || '',
            generatedFor: goal.targetRole,
        };
    }
};
exports.CareerService = CareerService;
exports.CareerService = CareerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CareerService);
//# sourceMappingURL=career.service.js.map