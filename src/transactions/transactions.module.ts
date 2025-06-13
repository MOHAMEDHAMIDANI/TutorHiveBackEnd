import { Module } from '@nestjs/common';

import { TransactionsController } from './transactions.controller';

import { TransactionsService } from './transactions.service';
import { RelationalTransactionPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from 'src/users/users.module';

const infrastructurePersistenceModule = RelationalTransactionPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule, UsersModule],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService, infrastructurePersistenceModule],
})
export class TransactionsModule {}
