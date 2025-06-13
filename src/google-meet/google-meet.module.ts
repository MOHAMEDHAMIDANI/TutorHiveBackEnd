import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleMeetService } from './google-meet.service';
import { GoogleMeetController } from './google-meet.controller';
import { GoogleMeetEntity } from './infrastructure/persistence/relational/entities/google-meet.entity';
import { GoogleMeetRepository } from './infrastructure/persistence/relational/repositories/google-meet.repository';
import { UsersModule } from '../users/users.module';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GoogleMeetEntity]),
    UsersModule,
    BookingsModule,
  ],
  controllers: [GoogleMeetController],
  providers: [GoogleMeetService, GoogleMeetRepository],
  exports: [GoogleMeetService],
})
export class GoogleMeetModule {} 