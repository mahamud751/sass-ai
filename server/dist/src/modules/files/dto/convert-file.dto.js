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
exports.ConvertFileDto = exports.ConvertMode = exports.ConvertTargetFormat = void 0;
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var ConvertTargetFormat;
(function (ConvertTargetFormat) {
    ConvertTargetFormat["PDF"] = "pdf";
    ConvertTargetFormat["DOCX"] = "docx";
})(ConvertTargetFormat || (exports.ConvertTargetFormat = ConvertTargetFormat = {}));
var ConvertMode;
(function (ConvertMode) {
    ConvertMode["EXACT"] = "exact";
    ConvertMode["RICH"] = "rich";
    ConvertMode["TEXT"] = "text";
})(ConvertMode || (exports.ConvertMode = ConvertMode = {}));
class ConvertFileDto {
    fileId;
    targetFormat;
    mode;
}
exports.ConvertFileDto = ConvertFileDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ConvertFileDto.prototype, "fileId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: ConvertTargetFormat }),
    (0, class_validator_1.IsEnum)(ConvertTargetFormat),
    __metadata("design:type", String)
], ConvertFileDto.prototype, "targetFormat", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: ConvertMode, default: ConvertMode.EXACT }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(ConvertMode),
    __metadata("design:type", String)
], ConvertFileDto.prototype, "mode", void 0);
//# sourceMappingURL=convert-file.dto.js.map