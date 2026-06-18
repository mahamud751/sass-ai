import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { FamilyModule } from './modules/family/family.module';
import { MedicineModule } from './modules/medicine/medicine.module';
import { PrescriptionsModule } from './modules/prescriptions/prescriptions.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { AiModule } from './modules/ai/ai.module';
import { FilesModule } from './modules/files/files.module';
import { HealthModule } from './modules/health/health.module';
import { FinanceModule } from './modules/finance/finance.module';
import { TasksModule } from './modules/tasks/tasks.module';
import { CyclesModule } from './modules/cycles/cycles.module';
import { PregnancyModule } from './modules/pregnancy/pregnancy.module';
import { ImmunizationsModule } from './modules/immunizations/immunizations.module';
import { CareerModule } from './modules/career/career.module';
import { BillsModule } from './modules/bills/bills.module';
import { GoalsModule } from './modules/goals/goals.module';
import { LearningModule } from './modules/learning/learning.module';
import { TravelModule } from './modules/travel/travel.module';
import { ImportantDatesModule } from './modules/important-dates/important-dates.module';
import { MemoryModule } from './modules/memory/memory.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { UsersModule } from './modules/users/users.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { Reflector } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    PrismaModule,
    AuthModule,
    FamilyModule,
    MedicineModule,
    PrescriptionsModule,
    DocumentsModule,
    DashboardModule,
    AiModule,
    FilesModule,
    HealthModule,
    FinanceModule,
    TasksModule,
    CyclesModule,
    PregnancyModule,
    ImmunizationsModule,
    CareerModule,
    BillsModule,
    GoalsModule,
    LearningModule,
    TravelModule,
    ImportantDatesModule,
    MemoryModule,
    NotificationsModule,
    UsersModule,
    // NOTE: Learning, Travel, ImportantDates etc. are stubbed but ready for implementation.
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
