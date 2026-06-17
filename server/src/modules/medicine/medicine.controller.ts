import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MedicineService } from './medicine.service';
import { CreateMedicineDto } from './dto/create-medicine.dto';
import { LogMedicineDto } from './dto/log-medicine.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Medicine')
@Controller('medicines')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MedicineController {
  constructor(private readonly medicineService: MedicineService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new medicine reminder' })
  create(@CurrentUser() user: any, @Body() dto: CreateMedicineDto) {
    return this.medicineService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all medicines (optionally filter by family member)' })
  findAll(@CurrentUser() user: any, @Query('familyMemberId') familyMemberId?: string) {
    return this.medicineService.findAll(user.id, { familyMemberId });
  }

  @Get('today')
  @ApiOperation({ summary: 'Get today\'s medicines with schedule' })
  findToday(@CurrentUser() user: any) {
    return this.medicineService.findToday(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get single medicine with logs' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.medicineService.findOne(user.id, id);
  }

  @Post(':id/log')
  @ApiOperation({ summary: 'Mark medicine taken or skipped' })
  log(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: LogMedicineDto,
  ) {
    return this.medicineService.log(user.id, id, dto);
  }

  @Get(':id/logs')
  @ApiOperation({ summary: 'Get medicine history logs' })
  getLogs(@CurrentUser() user: any, @Param('id') id: string) {
    return this.medicineService.getLogs(user.id, id);
  }
}
