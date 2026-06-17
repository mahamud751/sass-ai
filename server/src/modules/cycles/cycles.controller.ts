import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CyclesService } from './cycles.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Cycles (Women Health)')
@Controller('cycles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Post()
  @ApiOperation({ summary: 'Log a menstrual cycle / period' })
  create(@CurrentUser() user: any, @Body() dto: CreateCycleDto) {
    return this.cyclesService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List cycle logs (optionally filter by member)' })
  findAll(@CurrentUser() user: any, @Query('familyMemberId') familyMemberId?: string) {
    return this.cyclesService.findAll(user.id, familyMemberId);
  }

  @Get('predict/:memberId')
  @ApiOperation({ summary: 'Predict next period for a member' })
  predict(@CurrentUser() user: any, @Param('memberId') memberId: string) {
    return this.cyclesService.predictNext(user.id, memberId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a cycle log' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.cyclesService.remove(user.id, id);
  }
}
