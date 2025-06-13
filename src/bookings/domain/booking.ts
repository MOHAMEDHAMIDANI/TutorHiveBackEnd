import { IsOptional, IsDate, IsEnum, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';
import { Service } from 'src/services/domain/service';

const idType = Number;

export enum BookingType {
  SERVICE = 'service',
  TUTOR = 'tutor'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  CANCELLED = 'cancelled',
  COMPLETED = 'completed'
}

export class Booking {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    enum: BookingType,
    description: 'Type of booking (service or tutor)',
  })
  @IsEnum(BookingType)
  type: BookingType;

  @ApiProperty({
    type: Date,
    description: 'Date of the booking',
  })
  @IsDate()
  date: Date;

  @ApiProperty({
    type: String,
    description: 'Start time of the booking (HH:mm)',
  })
  fromTime: string;

  @ApiProperty({
    type: String,
    description: 'End time of the booking (HH:mm)', 
  })
  toTime: string;

  @ApiProperty({
    type: Number,
    description: 'Duration in minutes',
  })
  @IsNumber()
  duration: number;

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
    description: 'Total amount for the booking',
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    type: () => User,
    description: 'The user who made the booking',
  })
  bookedBy: User;

  @ApiProperty({
    type: () => User,
    description: 'The tutor who was booked (if type is TUTOR)',
    required: false,
  })
  @IsOptional()
  tutor?: User;

  @ApiProperty({
    type: () => Service,
    description: 'The service that was booked (if type is SERVICE)',
    required: false,
  })
  @IsOptional()
  service?: Service;

  @ApiProperty({
    type: String,
    description: 'Any special notes or requirements',
    required: false,
  })
  @IsOptional()
  notes?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;
}
