import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsNumber, IsOptional, IsString, IsUrl } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGoogleMeetDto {
  @ApiProperty({
    type: String,
    description: 'Title of the Google Meet session',
    example: 'Math Tutoring Session'
  })
  @IsString()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Description of the Google Meet session',
    example: 'Session to discuss calculus problems'
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: Date,
    description: 'Start time of the Google Meet session',
    example: '2023-06-15T14:00:00Z'
  })
  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @ApiProperty({
    type: Date,
    description: 'End time of the Google Meet session',
    example: '2023-06-15T15:00:00Z'
  })
  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @ApiProperty({
    type: Number,
    description: 'ID of the organizer',
    example: 1
  })
  @IsNumber()
  organizerId: number;

  @ApiProperty({
    type: Number,
    description: 'ID of the attendee',
    example: 2
  })
  @IsNumber()
  attendeeId: number;

  @ApiProperty({
    type: Number,
    description: 'ID of the associated booking',
    example: 1,
    required: false
  })
  @IsOptional()
  @IsNumber()
  bookingId?: number;
} 