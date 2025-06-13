import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { User } from '../../users/domain/user';
import { Service } from 'src/services/domain/service';
import { BookingType, PaymentStatus, BookingStatus } from '../domain/booking';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({
    enum: BookingType,
    description: 'Type of booking (service or tutor)',
  })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty({
    type: Date,
    description: 'Date of the booking',
    example: '2024-01-01'
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  date: Date;

  @ApiProperty({
    type: String,
    description: 'Start time of the booking (HH:mm)',
  })
  @IsString()
  fromTime: string;

  @ApiProperty({
    type: String,
    description: 'End time of the booking (HH:mm)',
  })
  @IsString()
  toTime: string;

  // @ApiProperty({
  //   type: Number,
  //   description: 'Duration in minutes',
  // })
  // @IsNumber()
  // duration: number;

  @ApiProperty({
    enum: PaymentStatus,
    description: 'Status of payment',
  })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({
    enum: BookingStatus,
    description: 'Status of booking',
  })
  @IsEnum(BookingStatus)
  bookingStatus: BookingStatus;

  @ApiProperty({
    type: Number,
    description: 'The tutor who was booked (if type is TUTOR)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  tutorId?: number;

  @ApiProperty({
    type: Number,
    description: 'The service that was booked (if type is SERVICE)',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  serviceId?: number;

  @ApiProperty({
    type: String,
    description: 'Any special notes or requirements',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
