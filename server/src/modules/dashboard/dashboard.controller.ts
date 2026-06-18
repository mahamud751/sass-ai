import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('emergency')
  @ApiOperation({ summary: 'Emergency overview from family, meds, allergies' })
  getEmergency(@CurrentUser() user: any) {
    return this.dashboardService.getEmergencyOverview(user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get complete home dashboard data' })
  getDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getDashboard(user.id);
  }
}
