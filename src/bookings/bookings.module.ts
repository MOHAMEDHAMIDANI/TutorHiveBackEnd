import { Module } from '@nestjs/common';

import { BookingsController } from './bookings.controller';

import { BookingsService } from './bookings.service';
import { RelationalBookingPersistenceModule } from './infrastructure/persistence/relational/relational-persistence.module';
import { FilesModule } from '../files/files.module';
import { UsersModule } from 'src/users/users.module';
import { ServicesModule } from 'src/services/services.module';
import { TransactionsModule } from 'src/transactions/transactions.module';
import { MailModule } from 'src/mail/mail.module';

const infrastructurePersistenceModule = RelationalBookingPersistenceModule;

@Module({
  imports: [infrastructurePersistenceModule, FilesModule, UsersModule, TransactionsModule, ServicesModule, MailModule],
  controllers: [BookingsController],
  providers: [BookingsService],
  exports: [BookingsService, infrastructurePersistenceModule],
})
export class BookingsModule {}
