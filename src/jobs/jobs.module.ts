import { Module } from '@nestjs/common';

import { JobsController } from './jobs.controller';

import { JobsService } from './jobs.service';
import { RelationalJobPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { UsersModule } from 'src/users/users.module';


const infrastructurePersistenceModule = RelationalJobPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, UsersModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService, infrastructurePersistenceModule],
})
export class JobsModule {}
