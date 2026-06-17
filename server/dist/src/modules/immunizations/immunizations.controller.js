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
exports.ImmunizationsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const immunizations_service_1 = require("./immunizations.service");
const create_immunization_dto_1 = require("./dto/create-immunization.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let ImmunizationsController = class ImmunizationsController {
    immunizationsService;
    constructor(immunizationsService) {
        this.immunizationsService = immunizationsService;
    }
    create(user, dto) {
        return this.immunizationsService.create(user.id, dto);
    }
    findAll(user, familyMemberId) {
        return this.immunizationsService.findAll(user.id, familyMemberId);
    }
    due(user) {
        return this.immunizationsService.getDue(user.id);
    }
    markGiven(user, id, body) {
        return this.immunizationsService.markGiven(user.id, id, body);
    }
    remove(user, id) {
        return this.immunizationsService.remove(user.id, id);
    }
};
exports.ImmunizationsController = ImmunizationsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Record or schedule a vaccine (Tika) for a child' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_immunization_dto_1.CreateImmunizationDto]),
    __metadata("design:returntype", void 0)
], ImmunizationsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List immunizations (filter by child member)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('familyMemberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ImmunizationsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('due'),
    (0, swagger_1.ApiOperation)({ summary: 'Upcoming vaccines (due or overdue)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ImmunizationsController.prototype, "due", null);
__decorate([
    (0, common_1.Patch)(':id/given'),
    (0, swagger_1.ApiOperation)({ summary: 'Mark vaccine as administered today (or given date)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], ImmunizationsController.prototype, "markGiven", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], ImmunizationsController.prototype, "remove", null);
exports.ImmunizationsController = ImmunizationsController = __decorate([
    (0, swagger_1.ApiTags)('Immunizations (Baby & Child Tika)'),
    (0, common_1.Controller)('immunizations'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [immunizations_service_1.ImmunizationsService])
], ImmunizationsController);
//# sourceMappingURL=immunizations.controller.js.map