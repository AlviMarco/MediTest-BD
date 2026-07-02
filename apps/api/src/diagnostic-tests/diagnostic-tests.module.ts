import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiagnosticTestsService } from './diagnostic-tests.service';
import { DiagnosticTestsController } from './diagnostic-tests.controller';
import { DiagnosticTest } from './diagnostic-test.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DiagnosticTest])],
  controllers: [DiagnosticTestsController],
  providers: [DiagnosticTestsService],
  exports: [DiagnosticTestsService],
})
export class DiagnosticTestsModule {}