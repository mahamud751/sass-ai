import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Bills & Subscriptions')
@Controller('bills')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Post()
  @ApiOperation({ summary: 'Create bill/subscription' })
  create(@CurrentUser() user: any, @Body() dto: any) {
    return this.billsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bills' })
  findAll(@CurrentUser() user: any) {
    return this.billsService.findAll(user.id);
  }

  @Patch(':id/paid')
  @ApiOperation({ summary: 'Mark as paid' })
  markPaid(@CurrentUser() user: any, @Param('id') id: string) {
    return this.billsService.markPaid(user.id, id);
  }
}
