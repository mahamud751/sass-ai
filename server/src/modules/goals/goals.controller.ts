import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Goals')
@Controller('goals')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Create goal' })
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.goalsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List goals' })
  findAll(@CurrentUser() user: any) {
    return this.goalsService.findAll(user.id);
  }

  @Patch(':id/progress')
  @ApiOperation({ summary: 'Update progress' })
  update(@CurrentUser() user: any, @Param('id') id: string, @Body() body: { progress: number }) {
    return this.goalsService.updateProgress(user.id, id, body.progress);
  }
}
