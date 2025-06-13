import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail.service';
import { MailerModule } from '../mailer/mailer.module';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [ConfigModule, MailerModule, UsersModule],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
