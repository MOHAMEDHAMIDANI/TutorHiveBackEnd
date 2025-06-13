import { Module } from '@nestjs/common';

import { BidsController } from './bids.controller';

import { BidsService } from './bids.service';
import { RelationalBidPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from 'src/users/users.module';
import { MailModule } from 'src/mail/mail.module';
import { JobsModule } from 'src/jobs/jobs.module';
import { TransactionsModule } from 'src/transactions/transactions.module';

const infrastructurePersistenceModule = RelationalBidPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule, UsersModule, MailModule, JobsModule, TransactionsModule],
  controllers: [BidsController],
  providers: [BidsService],
  exports: [BidsService, infrastructurePersistenceModule],
})
export class BidsModule {}
