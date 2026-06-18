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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditFileHtmlDto = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class EditFileHtmlDto {
    fileId;
    html;
    editBundleId;
    exportPdf;
    baselinePlainText;
    editedPlainText;
}
exports.EditFileHtmlDto = EditFileHtmlDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditFileHtmlDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Full HTML document from format editor' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditFileHtmlDto.prototype, "html", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Editor asset bundle id (images/styles folder)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditFileHtmlDto.prototype, "editBundleId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Also export exact PDF after save' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], EditFileHtmlDto.prototype, "exportPdf", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Plain text from editor at open (browser innerText)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditFileHtmlDto.prototype, "baselinePlainText", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Plain text after edits (browser innerText)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], EditFileHtmlDto.prototype, "editedPlainText", void 0);
//# sourceMappingURL=edit-file-html.dto.js.map