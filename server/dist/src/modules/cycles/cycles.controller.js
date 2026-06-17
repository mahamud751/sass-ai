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
exports.CyclesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const cycles_service_1 = require("./cycles.service");
const create_cycle_dto_1 = require("./dto/create-cycle.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CyclesController = class CyclesController {
    cyclesService;
    constructor(cyclesService) {
        this.cyclesService = cyclesService;
    }
    create(user, dto) {
        return this.cyclesService.create(user.id, dto);
    }
    findAll(user, familyMemberId) {
        return this.cyclesService.findAll(user.id, familyMemberId);
    }
    predict(user, memberId) {
        return this.cyclesService.predictNext(user.id, memberId);
    }
    remove(user, id) {
        return this.cyclesService.remove(user.id, id);
    }
};
exports.CyclesController = CyclesController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Log a menstrual cycle / period' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_cycle_dto_1.CreateCycleDto]),
    __metadata("design:returntype", void 0)
], CyclesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List cycle logs (optionally filter by member)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('familyMemberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CyclesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('predict/:memberId'),
    (0, swagger_1.ApiOperation)({ summary: 'Predict next period for a member' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('memberId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CyclesController.prototype, "predict", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete a cycle log' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CyclesController.prototype, "remove", null);
exports.CyclesController = CyclesController = __decorate([
    (0, swagger_1.ApiTags)('Cycles (Women Health)'),
    (0, common_1.Controller)('cycles'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [cycles_service_1.CyclesService])
], CyclesController);
//# sourceMappingURL=cycles.controller.js.map