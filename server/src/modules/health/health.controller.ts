import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HealthService } from './health.service';
import { CreateHealthRecordDto } from './dto/create-health-record.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Health Records')
@Controller('health-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Post()
  @ApiOperation({ summary: 'Create health record (prescription, blood test, etc)' })
  create(@CurrentUser() user: any, @Body() dto: CreateHealthRecordDto) {
    return this.healthService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List health records' })
  findAll(@CurrentUser() user: any, @Query('memberId') memberId?: string) {
    return this.healthService.findAll(user.id, memberId);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get records for a family member' })
  findByMember(@CurrentUser() user: any, @Param('memberId') memberId: string) {
    return this.healthService.findByMember(user.id, memberId);
  }
}
