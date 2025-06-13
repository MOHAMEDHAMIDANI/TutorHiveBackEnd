import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateBookingDto } from './create-booking.dto';
import { Type } from 'class-transformer';
import { IsOptional, IsDate, IsEnum, IsNumber, IsString } from 'class-validator';
import { User } from '../../users/domain/user';
import { Service } from '../../services/domain/service';

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

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional({
    enum: BookingType,
    description: 'Type of booking (service or tutor)'
  })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiPropertyOptional({
    type: Date,
    description: 'Date of the booking'
  })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({
    type: String,
    description: 'Start time of the booking (HH:mm)'
  })
  @IsOptional()
  @IsString()
  fromTime?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'End time of the booking (HH:mm)'
  })
  @IsOptional()
  @IsString()
  toTime?: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Duration in minutes'
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: 'Status of payment'
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Status of booking'
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @ApiPropertyOptional({
    type: Number,
    description: 'Total amount for the booking'
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    type: () => User,
    description: 'The user who made the booking'
  })
  @IsOptional()
  @Type(() => User)
  bookedBy?: User;

  @ApiPropertyOptional({
    type: () => User,
    description: 'The tutor who was booked (if type is TUTOR)'
  })
  @IsOptional()
  @Type(() => User)
  tutor?: User;

  @ApiPropertyOptional({
    type: () => Service,
    description: 'The service that was booked (if type is SERVICE)'
  })
  @IsOptional()
  @Type(() => Service)
  service?: Service;

  @ApiPropertyOptional({
    type: String,
    description: 'Any special notes or requirements'
  })
  @IsOptional()
  notes?: string;
}
