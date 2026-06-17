"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const core_1 = require("@nestjs/core");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./modules/auth/auth.module");
const family_module_1 = require("./modules/family/family.module");
const medicine_module_1 = require("./modules/medicine/medicine.module");
const documents_module_1 = require("./modules/documents/documents.module");
const dashboard_module_1 = require("./modules/dashboard/dashboard.module");
const ai_module_1 = require("./modules/ai/ai.module");
const files_module_1 = require("./modules/files/files.module");
const health_module_1 = require("./modules/health/health.module");
const finance_module_1 = require("./modules/finance/finance.module");
const tasks_module_1 = require("./modules/tasks/tasks.module");
const cycles_module_1 = require("./modules/cycles/cycles.module");
const pregnancy_module_1 = require("./modules/pregnancy/pregnancy.module");
const immunizations_module_1 = require("./modules/immunizations/immunizations.module");
const career_module_1 = require("./modules/career/career.module");
const bills_module_1 = require("./modules/bills/bills.module");
const goals_module_1 = require("./modules/goals/goals.module");
const learning_module_1 = require("./modules/learning/learning.module");
const travel_module_1 = require("./modules/travel/travel.module");
const important_dates_module_1 = require("./modules/important-dates/important-dates.module");
const memory_module_1 = require("./modules/memory/memory.module");
const notifications_module_1 = require("./modules/notifications/notifications.module");
const users_module_1 = require("./modules/users/users.module");
const jwt_auth_guard_1 = require("./common/guards/jwt-auth.guard");
const configuration_1 = __importDefault(require("./config/configuration"));
const env_validation_1 = require("./config/env.validation");
const core_2 = require("@nestjs/core");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
                validate: env_validation_1.validate,
            }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            family_module_1.FamilyModule,
            medicine_module_1.MedicineModule,
            documents_module_1.DocumentsModule,
            dashboard_module_1.DashboardModule,
            ai_module_1.AiModule,
            files_module_1.FilesModule,
            health_module_1.HealthModule,
            finance_module_1.FinanceModule,
            tasks_module_1.TasksModule,
            cycles_module_1.CyclesModule,
            pregnancy_module_1.PregnancyModule,
            immunizations_module_1.ImmunizationsModule,
            career_module_1.CareerModule,
            bills_module_1.BillsModule,
            goals_module_1.GoalsModule,
            learning_module_1.LearningModule,
            travel_module_1.TravelModule,
            important_dates_module_1.ImportantDatesModule,
            memory_module_1.MemoryModule,
            notifications_module_1.NotificationsModule,
            users_module_1.UsersModule,
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            core_2.Reflector,
            {
                provide: core_1.APP_GUARD,
                useClass: jwt_auth_guard_1.JwtAuthGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map