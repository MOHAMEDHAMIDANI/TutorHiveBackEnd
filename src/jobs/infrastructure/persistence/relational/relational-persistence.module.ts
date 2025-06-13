import { Module } from '@nestjs/common';
import { JobRepository } from '../job.repository';
import { JobsRelationalRepository } from './repositories/job.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JobEntity } from './entities/job.entity';

@Module({
  imports: [TypeOrmModule.forFeature([JobEntity])],
  providers: [
    {
      provide: JobRepository,
      useClass: JobsRelationalRepository,
    },
  ],
  exports: [JobRepository],
})
export class RelationalJobPersistenceModule {}
