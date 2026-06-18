import { Controller, Get, Post, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PrescriptionsService } from './prescriptions.service';
import { CreatePrescriptionDto } from './dto/create-prescription.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Prescriptions')
@Controller('prescriptions')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PrescriptionsController {
  constructor(private readonly prescriptionsService: PrescriptionsService) {}

  @Post()
  @ApiOperation({ summary: 'Create prescription with medicine items for a patient' })
  create(@CurrentUser() user: any, @Body() dto: CreatePrescriptionDto) {
    return this.prescriptionsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List prescriptions (filter by patient/family member)' })
  findAll(
    @CurrentUser() user: any,
    @Query('familyMemberId') familyMemberId?: string,
  ) {
    return this.prescriptionsService.findAll(user.id, familyMemberId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get prescription with all medicine items' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.prescriptionsService.findOne(user.id, id);
  }

  @Post(':id/auto-add-medicines')
  @ApiOperation({ summary: 'Auto-create medicine reminders for all prescription items' })
  autoAddMedicines(@CurrentUser() user: any, @Param('id') id: string) {
    return this.prescriptionsService.autoAddMedicines(user.id, id);
  }

  @Post(':id/items/:itemId/add-medicine')
  @ApiOperation({ summary: 'Create medicine reminder from a single prescription item' })
  addMedicineFromItem(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Param('itemId') itemId: string,
  ) {
    return this.prescriptionsService.addMedicineFromItem(user.id, id, itemId);
  }
}