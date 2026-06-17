import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCareerGoalDto } from './dto/create-career-goal.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';

@Injectable()
export class CareerService {
  constructor(private prisma: PrismaService) {}

  async createGoal(userId: string, dto: CreateCareerGoalDto) {
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

  async getGoals(userId: string) {
    return this.prisma.careerGoal.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { 
        jobApplications: true,
        familyMember: { select: { id: true, fullName: true } }
      },
    });
  }

  async updateGoal(userId: string, id: string, dto: Partial<CreateCareerGoalDto>) {
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
        roadmap: dto.roadmap as any,
      },
    });
  }

  async deleteGoal(userId: string, id: string) {
    await this.findGoal(userId, id);
    return this.prisma.careerGoal.delete({ where: { id } });
  }

  private async findGoal(userId: string, id: string) {
    const g = await this.prisma.careerGoal.findFirst({ where: { id, userId } });
    if (!g) throw new NotFoundException('Career goal not found');
    return g;
  }

  // Job Applications
  async createApplication(userId: string, dto: CreateJobApplicationDto) {
    return this.prisma.jobApplication.create({
      data: {
        userId,
        careerGoalId: dto.careerGoalId,
        company: dto.company,
        role: dto.role,
        status: (dto.status as any) || 'APPLIED',
        appliedDate: dto.appliedDate ? new Date(dto.appliedDate) : new Date(),
        interviewDate: dto.interviewDate ? new Date(dto.interviewDate) : null,
        salaryOffered: dto.salaryOffered,
        notes: dto.notes,
        jobUrl: dto.jobUrl,
        resumeFileId: dto.resumeFileId,
      },
    });
  }

  async getApplications(userId: string, goalId?: string) {
    const where: any = { userId };
    if (goalId) where.careerGoalId = goalId;
    return this.prisma.jobApplication.findMany({ where, orderBy: { appliedDate: 'desc' } });
  }

  async updateApplicationStatus(userId: string, id: string, status: string, interviewDate?: string) {
    const app = await this.prisma.jobApplication.findFirst({ where: { id, userId } });
    if (!app) throw new NotFoundException();
    return this.prisma.jobApplication.update({
      where: { id },
      data: {
        status: status as any,
        interviewDate: interviewDate ? new Date(interviewDate) : undefined,
      },
    });
  }

  // AI-powered helpers (can be enhanced with real AI calls)
  async generateRoadmap(userId: string, goalId: string) {
    const goal = await this.findGoal(userId, goalId);
    // Simple but useful structured roadmap
    const steps = [
      { step: `Master core skills for ${goal.targetRole}`, done: false, dueInDays: 30, description: `Focus on: ${goal.skills?.slice(0,3).join(', ') || 'key technologies'}` },
      { step: 'Build portfolio projects', done: false, dueInDays: 60 },
      { step: `Update CV and LinkedIn for ${goal.targetRole}`, done: false, dueInDays: 15 },
      { step: 'Apply to 5-10 target companies', done: false, dueInDays: 90 },
      { step: 'Practice interviews', done: false, dueInDays: 45 },
    ];
    const roadmap = { steps, generatedAt: new Date().toISOString(), targetRole: goal.targetRole };
    return this.prisma.careerGoal.update({
      where: { id: goalId },
      data: { roadmap: roadmap as any },
    });
  }

  async analyzeSkills(userId: string, goalId: string) {
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

  async generateCV(userId: string, goalId: string, extraData?: any) {
    const goal = await this.findGoal(userId, goalId);
    // Return structured CV content (frontend can format nicely or save to Document)
    return {
      summary: `Experienced professional targeting ${goal.targetRole} at ${goal.targetCompany || 'leading companies'}.`,
      skills: goal.skills || [],
      targetRole: goal.targetRole,
      experience: extraData?.experience || 'Add your experience here',
      education: extraData?.education || '',
      generatedFor: goal.targetRole,
    };
  }
}
