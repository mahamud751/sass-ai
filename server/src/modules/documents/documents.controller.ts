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
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Documents')
@Controller('documents')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Post()
  @ApiOperation({ summary: 'Upload / create a new document record' })
  create(@CurrentUser() user: any, @Body() dto: CreateDocumentDto) {
    return this.documentsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List all documents' })
  findAll(@CurrentUser() user: any, @Query() query: any) {
    return this.documentsService.findAll(user.id, query);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search documents (AI friendly)' })
  search(@CurrentUser() user: any, @Query('q') q: string) {
    return this.documentsService.search(user.id, q || '');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get document by ID' })
  findOne(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update document' })
  update(
    @CurrentUser() user: any,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete document' })
  remove(@CurrentUser() user: any, @Param('id') id: string) {
    return this.documentsService.remove(user.id, id);
  }
}
