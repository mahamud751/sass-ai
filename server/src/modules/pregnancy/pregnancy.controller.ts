import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PregnancyService } from './pregnancy.service';
import { CreatePregnancyDto } from './dto/create-pregnancy.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Pregnancy')
@Controller('pregnancy')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PregnancyController {
  constructor(private readonly pregnancyService: PregnancyService) {}

  @Post()
  @ApiOperation({ summary: 'Create / start a pregnancy tracker for a female family member' })
  create(@CurrentUser() user: any, @Body() dto: CreatePregnancyDto) {
    return this.pregnancyService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.pregnancyService.findAll(user.id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: Partial<CreatePregnancyDto>,
  ) {
    return this.pregnancyService.update(user.id, id, dto);
  }

  @Delete(':id')
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.pregnancyService.remove(user.id, id);
  }
}
