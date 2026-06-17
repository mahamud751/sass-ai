import { Controller, Get, Post, Body, UseGuards, Param, Patch, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CareerService } from './career.service';
import { CreateCareerGoalDto } from './dto/create-career-goal.dto';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Career')
@Controller('career')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @Post('goals')
  @ApiOperation({ summary: 'Create career goal' })
  createGoal(@CurrentUser() user: any, @Body() dto: CreateCareerGoalDto) {
    return this.careerService.createGoal(user.id, dto);
  }

  @Get('goals')
  @ApiOperation({ summary: 'List career goals with applications' })
  getGoals(@CurrentUser() user: any) {
    return this.careerService.getGoals(user.id);
  }

  @Patch('goals/:id')
  @ApiOperation({ summary: 'Update career goal (incl. roadmap, skills)' })
  updateGoal(@CurrentUser() user: any, @Param('id') id: string, @Body() dto: Partial<CreateCareerGoalDto>) {
    return this.careerService.updateGoal(user.id, id, dto);
  }

  @Delete('goals/:id')
  @ApiOperation({ summary: 'Delete career goal' })
  deleteGoal(@CurrentUser() user: any, @Param('id') id: string) {
    return this.careerService.deleteGoal(user.id, id);
  }

  // Job Applications
  @Post('applications')
  @ApiOperation({ summary: 'Create job application (link to goal + resume)' })
  createApp(@CurrentUser() user: any, @Body() dto: CreateJobApplicationDto) {
    return this.careerService.createApplication(user.id, dto);
  }

  @Get('applications')
  @ApiOperation({ summary: 'List applications (optionally filter by goal)' })
  getApps(@CurrentUser() user: any, @Query('goalId') goalId?: string) {
    return this.careerService.getApplications(user.id, goalId);
  }

  @Patch('applications/:id/status')
  @ApiOperation({ summary: 'Update application status + interview date' })
  updateAppStatus(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { status: string; interviewDate?: string }) {
    return this.careerService.updateApplicationStatus(user.id, id, body.status, body.interviewDate);
  }

  // AI Career Features (flat paths to avoid any routing issues)
  @Post('roadmap/:id')
  @ApiOperation({ summary: 'Generate AI-style career roadmap for goal' })
  generateRoadmap(@CurrentUser() user: any, @Param('id') id: string) {
    return this.careerService.generateRoadmap(user.id, id);
  }

  @Get('analyze/:id')
  @ApiOperation({ summary: 'Skill gap analysis' })
  analyzeSkills(@CurrentUser() user: any, @Param('id') id: string) {
    return this.careerService.analyzeSkills(user.id, id);
  }

  @Get('cv/:id')
  @ApiOperation({ summary: 'Generate CV content for goal' })
  generateCV(@CurrentUser() user: any, @Param('id') id: string) {
    return this.careerService.generateCV(user.id, id);
  }
}
