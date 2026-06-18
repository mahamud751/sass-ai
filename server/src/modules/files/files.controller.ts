import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  StreamableFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { FilesService } from './files.service';
import { ConvertFileDto } from './dto/convert-file.dto';
import { EditFileDto } from './dto/edit-file.dto';
import { EditFileHtmlDto } from './dto/edit-file-html.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a file (returns file record)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  }))
  uploadFile(@CurrentUser() user: any, @UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    return this.filesService.saveUploadedFile(user.id, file);
  }

  @Post('upload-convert')
  @ApiOperation({ summary: 'Upload PDF/DOC from device and convert in one step' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        targetFormat: { type: 'string', enum: ['pdf', 'docx'] },
      },
      required: ['file', 'targetFormat'],
    },
  })
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  uploadAndConvert(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('targetFormat') targetFormat: 'pdf' | 'docx',
    @Body('mode') mode?: 'exact' | 'rich' | 'text',
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!targetFormat || !['pdf', 'docx'].includes(targetFormat)) {
      throw new BadRequestException('targetFormat must be pdf or docx');
    }
    return this.filesService.uploadAndConvert(user.id, file, targetFormat, mode || 'exact');
  }

  @Get('converter/capabilities')
  @ApiOperation({ summary: 'Check exact-format converter availability (LibreOffice)' })
  getConverterCapabilities() {
    return this.filesService.getConverterCapabilities();
  }

  @Get()
  @ApiOperation({ summary: 'List uploaded files' })
  getFiles(@CurrentUser() user: any) {
    return this.filesService.findUserFiles(user.id);
  }

  @Post('edit-html')
  @ApiOperation({ summary: 'Save format-preserved editor (exact DOCX + optional PDF)' })
  saveFormatEditor(@CurrentUser() user: any, @Body() dto: EditFileHtmlDto) {
    return this.filesService.saveFormatEditor(
      user.id,
      dto.fileId,
      dto.html,
      dto.editBundleId,
      dto.exportPdf ?? false,
      dto.baselinePlainText,
      dto.editedPlainText,
    );
  }

  @Post('convert')
  @ApiOperation({ summary: 'Convert PDF to DOCX or DOCX to PDF' })
  convert(@CurrentUser() user: any, @Body() dto: ConvertFileDto) {
    return this.filesService.convertFile(
      user.id,
      dto.fileId,
      dto.targetFormat,
      dto.mode || 'exact',
    );
  }

  @Post('edit')
  @ApiOperation({ summary: 'Edit document content and save as new file' })
  edit(@CurrentUser() user: any, @Body() dto: EditFileDto) {
    return this.filesService.editFileContent(user.id, dto.fileId, dto.content);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file (attachment)' })
  async downloadFile(
    @CurrentUser() user: any,
    @Param('id') id: string,
  ): Promise<StreamableFile> {
    const { stream, filename, mimetype } = await this.filesService.getFileDownload(user.id, id);
    const encoded = encodeURIComponent(filename);
    return new StreamableFile(stream, {
      type: mimetype,
      disposition: `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
    });
  }

  @Get(':id/html')
  @ApiOperation({ summary: 'Extract HTML preview from document' })
  extractHtml(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.extractHtml(user.id, id).then((html) => ({ html }));
  }

  @Get(':id/text')
  @ApiOperation({ summary: 'Extract text from PDF, DOCX, or TXT file' })
  extractText(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.extractText(user.id, id);
  }

  @Post(':id/prepare-edit')
  @ApiOperation({ summary: 'Prepare document for text editing (PDF auto-converts to DOCX)' })
  prepareForEdit(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.prepareForEdit(user.id, id);
  }

  @Post(':id/open-editor')
  @ApiOperation({ summary: 'Open PDF/Word in format-preserved editor (exact layout)' })
  openFormatEditor(@CurrentUser() user: any, @Param('id') id: string) {
    return this.filesService.openFormatEditor(user.id, id);
  }
}
