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
import { ImmunizationsService } from './immunizations.service';
import { CreateImmunizationDto } from './dto/create-immunization.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Immunizations (Baby & Child Tika)')
@Controller('immunizations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ImmunizationsController {
  constructor(private readonly immunizationsService: ImmunizationsService) {}

  @Post()
  @ApiOperation({ summary: 'Record or schedule a vaccine (Tika) for a child' })
  create(@CurrentUser() user: any, @Body() dto: CreateImmunizationDto) {
    return this.immunizationsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List immunizations (filter by child member)' })
  findAll(@CurrentUser() user: any, @Query('familyMemberId') familyMemberId?: string) {
    return this.immunizationsService.findAll(user.id, familyMemberId);
  }

  @Get('due')
  @ApiOperation({ summary: 'Upcoming vaccines (due or overdue)' })
  due(@CurrentUser() user: any) {
    return this.immunizationsService.getDue(user.id);
  }

  @Patch(':id/given')
  @ApiOperation({ summary: 'Mark vaccine as administered today (or given date)' })
  markGiven(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() body: { administeredDate?: string; notes?: string },
  ) {
    return this.immunizationsService.markGiven(user.id, id, body);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.immunizationsService.remove(user.id, id);
  }
}
