import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUrl } from 'class-validator';
import { User } from '../../users/domain/user';
import { Booking } from '../../bookings/domain/booking';

export class GoogleMeet {
  @ApiProperty({
    type: Number,
  })
  id: number;

  @ApiProperty({
    type: String,
    description: 'Title of the Google Meet session',
    example: 'Math Tutoring Session'
  })
  title: string;

  @ApiProperty({
    type: String,
    description: 'Description of the Google Meet session',
    example: 'Session to discuss calculus problems'
  })
  description: string;

  @ApiProperty({
    type: Date,
    description: 'Start time of the Google Meet session',
  })
  @IsDate()
  startTime: Date;

  @ApiProperty({
    type: Date,
    description: 'End time of the Google Meet session',
  })
  @IsDate()
  endTime: Date;

  @ApiProperty({
    type: String,
    description: 'Google Meet URL',
  })
  @IsUrl()
  meetUrl: string;

  @ApiProperty({
    type: String,
    description: 'Google Calendar Event ID',
  })
  @IsString()
  calendarEventId: string;

  @ApiProperty({
    type: () => User,
    description: 'The organizer of the Google Meet session',
  })
  organizer: User;

  @ApiProperty({
    type: () => User,
    description: 'The attendee of the Google Meet session',
  })
  attendee: User;

  @ApiProperty({
    type: () => Booking,
    description: 'The associated booking',
    required: false,
  })
  @IsOptional()
  booking?: Booking;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
} 