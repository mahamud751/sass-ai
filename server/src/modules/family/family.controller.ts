import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FamilyService } from './family.service';
import { CreateFamilyDto } from './dto/create-family.dto';
import { CreateFamilyMemberDto } from './dto/create-family-member.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Family')
@Controller('families')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FamilyController {
  constructor(private readonly familyService: FamilyService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new family group' })
  createFamily(@CurrentUser() user: any, @Body() dto: CreateFamilyDto) {
    return this.familyService.createFamily(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all family groups for user' })
  getFamilies(@CurrentUser() user: any) {
    return this.familyService.getFamilies(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get family by ID' })
  getFamily(@CurrentUser() user: any, @Param('id') id: string) {
    return this.familyService.getFamilyById(user.id, id);
  }

  @Post(':id/members')
  @ApiOperation({ summary: 'Add a family member' })
  addMember(
    @CurrentUser() user: any,
    @Param('id') familyId: string,
    @Body() dto: CreateFamilyMemberDto,
  ) {
    return this.familyService.addMember(user.id, familyId, dto);
  }

  @Get(':id/members')
  @ApiOperation({ summary: 'List family members' })
  getMembers(@CurrentUser() user: any, @Param('id') familyId: string) {
    return this.familyService.getMembers(user.id, familyId);
  }

  @Get('members/:memberId')
  @ApiOperation({ summary: 'Get single family member details' })
  getMember(@CurrentUser() user: any, @Param('memberId') memberId: string) {
    return this.familyService.getMemberDetails(user.id, memberId);
  }
}
