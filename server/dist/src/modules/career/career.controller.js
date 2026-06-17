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
exports.CareerController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const career_service_1 = require("./career.service");
const create_career_goal_dto_1 = require("./dto/create-career-goal.dto");
const create_job_application_dto_1 = require("./dto/create-job-application.dto");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const current_user_decorator_1 = require("../../common/decorators/current-user.decorator");
let CareerController = class CareerController {
    careerService;
    constructor(careerService) {
        this.careerService = careerService;
    }
    createGoal(user, dto) {
        return this.careerService.createGoal(user.id, dto);
    }
    getGoals(user) {
        return this.careerService.getGoals(user.id);
    }
    updateGoal(user, id, dto) {
        return this.careerService.updateGoal(user.id, id, dto);
    }
    deleteGoal(user, id) {
        return this.careerService.deleteGoal(user.id, id);
    }
    createApp(user, dto) {
        return this.careerService.createApplication(user.id, dto);
    }
    getApps(user, goalId) {
        return this.careerService.getApplications(user.id, goalId);
    }
    updateAppStatus(user, id, body) {
        return this.careerService.updateApplicationStatus(user.id, id, body.status, body.interviewDate);
    }
    generateRoadmap(user, id) {
        return this.careerService.generateRoadmap(user.id, id);
    }
    analyzeSkills(user, id) {
        return this.careerService.analyzeSkills(user.id, id);
    }
    generateCV(user, id) {
        return this.careerService.generateCV(user.id, id);
    }
};
exports.CareerController = CareerController;
__decorate([
    (0, common_1.Post)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'Create career goal' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_career_goal_dto_1.CreateCareerGoalDto]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "createGoal", null);
__decorate([
    (0, common_1.Get)('goals'),
    (0, swagger_1.ApiOperation)({ summary: 'List career goals with applications' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "getGoals", null);
__decorate([
    (0, common_1.Patch)('goals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Update career goal (incl. roadmap, skills)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "updateGoal", null);
__decorate([
    (0, common_1.Delete)('goals/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete career goal' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "deleteGoal", null);
__decorate([
    (0, common_1.Post)('applications'),
    (0, swagger_1.ApiOperation)({ summary: 'Create job application (link to goal + resume)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, create_job_application_dto_1.CreateJobApplicationDto]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "createApp", null);
__decorate([
    (0, common_1.Get)('applications'),
    (0, swagger_1.ApiOperation)({ summary: 'List applications (optionally filter by goal)' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('goalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "getApps", null);
__decorate([
    (0, common_1.Patch)('applications/:id/status'),
    (0, swagger_1.ApiOperation)({ summary: 'Update application status + interview date' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "updateAppStatus", null);
__decorate([
    (0, common_1.Post)('roadmap/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate AI-style career roadmap for goal' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "generateRoadmap", null);
__decorate([
    (0, common_1.Get)('analyze/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Skill gap analysis' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "analyzeSkills", null);
__decorate([
    (0, common_1.Get)('cv/:id'),
    (0, swagger_1.ApiOperation)({ summary: 'Generate CV content for goal' }),
    __param(0, (0, current_user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", void 0)
], CareerController.prototype, "generateCV", null);
exports.CareerController = CareerController = __decorate([
    (0, swagger_1.ApiTags)('Career'),
    (0, common_1.Controller)('career'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    __metadata("design:paramtypes", [career_service_1.CareerService])
], CareerController);
//# sourceMappingURL=career.controller.js.map