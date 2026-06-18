"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const swagger_1 = require("@nestjs/swagger");
const files_service_1 = require("./files.service");
const convert_file_dto_1 = require("./dto/convert-file.dto");
const edit_file_dto_1 = require("./dto/edit-file.dto");
const edit_file_html_dto_1 = require("./dto/edit-file-html.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    uploadFile(user, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return this.filesService.saveUploadedFile(user.id, file);
    }
    uploadAndConvert(user, file, targetFormat, mode) {
        if (!file)
            throw new common_1.BadRequestException('No file uploaded');
        if (!targetFormat || !['pdf', 'docx'].includes(targetFormat)) {
            throw new common_1.BadRequestException('targetFormat must be pdf or docx');
        }
        return this.filesService.uploadAndConvert(user.id, file, targetFormat, mode || 'exact');
    }
    getConverterCapabilities() {
        return this.filesService.getConverterCapabilities();
    }
    getFiles(user) {
        return this.filesService.findUserFiles(user.id);
    }
    saveFormatEditor(user, dto) {
        return this.filesService.saveFormatEditor(user.id, dto.fileId, dto.html, dto.editBundleId, dto.exportPdf ?? false, dto.baselinePlainText, dto.editedPlainText);
    }
    convert(user, dto) {
        return this.filesService.convertFile(user.id, dto.fileId, dto.targetFormat, dto.mode || 'exact');
    }
    edit(user, dto) {
        return this.filesService.editFileContent(user.id, dto.fileId, dto.content);
    }
    async downloadFile(user, id) {
        const { stream, filename, mimetype } = await this.filesService.getFileDownload(user.id, id);
        const encoded = encodeURIComponent(filename);
        return new common_1.StreamableFile(stream, {
            type: mimetype,
            disposition: `attachment; filename="${encoded}"; filename*=UTF-8''${encoded}`,
        });
    }
    extractHtml(user, id) {
        return this.filesService.extractHtml(user.id, id).then((html) => ({ html }));
    }
    extractText(user, id) {
        return this.filesService.extractText(user.id, id);
    }
    prepareForEdit(user, id) {
        return this.filesService.prepareForEdit(user.id, id);
    }
    openFormatEditor(user, id) {
        return this.filesService.openFormatEditor(user.id, id);
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload a file (returns file record)' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: { file: { type: 'string', format: 'binary' } },
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload-convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Upload PDF/DOC from device and convert in one step' }),
    (0, swagger_1.ApiConsumes)('multipart/form-data'),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                file: { type: 'string', format: 'binary' },
                targetFormat: { type: 'string', enum: ['pdf', 'docx'] },
            },
            required: ['file', 'targetFormat'],
        },
    }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: { fileSize: 10 * 1024 * 1024 },
    })),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.UploadedFile)()),
    __param(2, (0, common_1.Body)('targetFormat')),
    __param(3, (0, common_1.Body)('mode')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "uploadAndConvert", null);
__decorate([
    (0, common_1.Get)('converter/capabilities'),
    (0, swagger_1.ApiOperation)({ summary: 'Check exact-format converter availability (LibreOffice)' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getConverterCapabilities", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List uploaded files' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "getFiles", null);
__decorate([
    (0, common_1.Post)('edit-html'),
    (0, swagger_1.ApiOperation)({ summary: 'Save format-preserved editor (exact DOCX + optional PDF)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, edit_file_html_dto_1.EditFileHtmlDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "saveFormatEditor", null);
__decorate([
    (0, common_1.Post)('convert'),
    (0, swagger_1.ApiOperation)({ summary: 'Convert PDF to DOCX or DOCX to PDF' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, convert_file_dto_1.ConvertFileDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "convert", null);
__decorate([
    (0, common_1.Post)('edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Edit document content and save as new file' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, edit_file_dto_1.EditFileDto]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "edit", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    (0, swagger_1.ApiOperation)({ summary: 'Download file (attachment)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Get)(':id/html'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract HTML preview from document' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "extractHtml", null);
__decorate([
    (0, common_1.Get)(':id/text'),
    (0, swagger_1.ApiOperation)({ summary: 'Extract text from PDF, DOCX, or TXT file' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "extractText", null);
__decorate([
    (0, common_1.Post)(':id/prepare-edit'),
    (0, swagger_1.ApiOperation)({ summary: 'Prepare document for text editing (PDF auto-converts to DOCX)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "prepareForEdit", null);
__decorate([
    (0, common_1.Post)(':id/open-editor'),
    (0, swagger_1.ApiOperation)({ summary: 'Open PDF/Word in format-preserved editor (exact layout)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], FilesController.prototype, "openFormatEditor", null);
exports.FilesController = FilesController = __decorate([
    (0, swagger_1.ApiTags)('Files'),
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map