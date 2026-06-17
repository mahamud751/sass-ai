import { Module } from '@nestjs/common';
import { ImmunizationsService } from './immunizations.service';
import { ImmunizationsController } from './immunizations.controller';

@Module({
  controllers: [ImmunizationsController],
  providers: [ImmunizationsService],
  exports: [ImmunizationsService],
})
export class ImmunizationsModule {}