import { Module } from '@nestjs/common';

import { ServicesController } from './services.controller';

import { ServicesService } from './services.service';
import { RelationalServicePersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from 'src/users/users.module';

const infrastructurePersistenceModule = RelationalServicePersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule, UsersModule],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService, infrastructurePersistenceModule],
})
export class ServicesModule {}
