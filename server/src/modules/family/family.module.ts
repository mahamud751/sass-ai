import { Module } from '@nestjs/common';
import { FamilyService } from './family.service';
import { FamilyController } from './family.controller';
import { FamilyAccessService } from './family-access.service';

@Module({
  controllers: [FamilyController],
  providers: [FamilyService, FamilyAccessService],
  exports: [FamilyService, FamilyAccessService],
})
export class FamilyModule {}
