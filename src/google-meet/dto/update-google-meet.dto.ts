import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateGoogleMeetDto } from './create-google-meet.dto';
import { IsDate, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGoogleMeetDto extends PartialType(CreateGoogleMeetDto) {
  @ApiPropertyOptional({
    type: String,
    description: 'Title of the Google Meet session',
    example: 'Math Tutoring Session'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Description of the Google Meet session',
    example: 'Session to discuss calculus problems'
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    type: Date,
    description: 'Start time of the Google Meet session',
    example: '2023-06-15T14:00:00Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startTime?: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'End time of the Google Meet session',
    example: '2023-06-15T15:00:00Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional({
    type: String,
    description: 'Google Meet URL',
    example: 'https://meet.google.com/abc-defg-hij'
  })
  @IsOptional()
  @IsUrl()
  meetUrl?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Google Calendar Event ID',
    example: 'abc123def456'
  })
  @IsOptional()
  @IsString()
  calendarEventId?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'ID of the organizer',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  organizerId?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'ID of the attendee',
    example: 2
  })
  @IsOptional()
  @IsNumber()
  attendeeId?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'ID of the associated booking',
    example: 1
  })
  @IsOptional()
  @IsNumber()
  bookingId?: number;
} 