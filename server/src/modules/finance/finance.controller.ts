import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinanceService } from './finance.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Finance')
@Controller('finance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Post('transactions')
  @ApiOperation({ summary: 'Create income or expense transaction' })
  create(@CurrentUser() user: any, @Body() dto: CreateTransactionDto) {
    return this.financeService.create(user.id, dto);
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List transactions' })
  findAll(@CurrentUser() user: any) {
    return this.financeService.findAll(user.id);
  }

  @Get('summary/monthly')
  @ApiOperation({ summary: 'Monthly summary' })
  monthly(@CurrentUser() user: any, @Query('year') year?: string, @Query('month') month?: string) {
    return this.financeService.getMonthlySummary(
      user.id,
      year ? parseInt(year) : undefined,
      month ? parseInt(month) : undefined,
    );
  }
}
