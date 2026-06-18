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
exports.CreateGoalDto = exports.GoalTypeDto = void 0;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
var GoalTypeDto;
(function (GoalTypeDto) {
    GoalTypeDto["PERSONAL"] = "PERSONAL";
    GoalTypeDto["MONEY"] = "MONEY";
    GoalTypeDto["HEALTH"] = "HEALTH";
    GoalTypeDto["CAREER"] = "CAREER";
    GoalTypeDto["LEARNING"] = "LEARNING";
    GoalTypeDto["FAMILY"] = "FAMILY";
    GoalTypeDto["OTHER"] = "OTHER";
})(GoalTypeDto || (exports.GoalTypeDto = GoalTypeDto = {}));
class CreateGoalDto {
    title;
    type;
    description;
    familyMemberId;
    progress;
}
exports.CreateGoalDto = CreateGoalDto;
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "title", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ enum: GoalTypeDto }),
    (0, class_validator_1.IsEnum)(GoalTypeDto),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "type", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Transform)(({ value }) => (value === '' || value == null ? undefined : value)),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], CreateGoalDto.prototype, "familyMemberId", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreateGoalDto.prototype, "progress", void 0);
//# sourceMappingURL=create-goal.dto.js.map