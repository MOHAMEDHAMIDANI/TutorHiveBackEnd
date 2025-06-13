import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
  IsEnum,
  Min,
  Max,
  IsInt,
} from "class-validator";
import { Transform, Type, plainToInstance } from "class-transformer";
import {
  BookingType,
  PaymentStatus,
  BookingStatus,
  Booking,
} from "../domain/booking";
import { User } from "../../users/domain/user";
import { Service } from "../../services/domain/service";

export class FilterBookingDto {
  @ApiPropertyOptional({
    type: [FilterBookingDto],
    description: "OR conditions for filtering",
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => FilterBookingDto)
  $or?: FilterBookingDto[];

  @ApiPropertyOptional({
    type: Number,
    description: "ID of the service provider (user)",
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => Number(value))
  serviceUserId?: number;

  @ApiPropertyOptional({
    enum: BookingType,
    description: "Type of booking (service or tutor)",
  })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiPropertyOptional({
    type: Date,
    description: "Date of the booking",
  })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({
    type: String,
    description: "Start time of the booking (HH:mm)",
  })
  @IsOptional()
  @IsString()
  fromTime?: string;

  @ApiPropertyOptional({
    type: String,
    description: "End time of the booking (HH:mm)",
  })
  @IsOptional()
  @IsString()
  toTime?: string;

  @ApiPropertyOptional({
    type: Number,
    description: "Duration in minutes",
  })
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: "Status of payment",
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    enum: BookingStatus,
    description: "Status of booking",
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @ApiPropertyOptional({
    type: Number,
    description: "Total amount for the booking",
  })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({
    type: () => User,
    description: "The user who made the booking",
  })
  @IsOptional()
  @Type(() => User)
  bookedBy?: User;

  @ApiPropertyOptional({
    type: () => User,
    description: "The tutor who was booked (if type is TUTOR)",
  })
  @IsOptional()
  @Type(() => User)
  tutor?: User;

  @ApiPropertyOptional({
    type: () => Service,
    description: "The service that was booked (if type is SERVICE)",
  })
  @IsOptional()
  @Type(() => Service)
  service?: Service;

  @ApiPropertyOptional({
    type: String,
    description: "Any special notes or requirements",
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class SortBookingDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof Booking;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryBookingDto {
  @ApiPropertyOptional({
    description: "Page number (defaults to 1)",
    example: 1,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) || num < 1 ? 1 : num; // Default to 1 if invalid
  })
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: "Number of items per page (defaults to 10)",
    example: 10,
  })
  @IsOptional()
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) || num < 1 ? 10 : num; // Default to 10 if invalid
  })
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    description: "Filters for the query (JSON string)",
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value
        ? plainToInstance(FilterBookingDto, JSON.parse(value))
        : null;
    } catch (e) {
      return null; // Return null if JSON parsing fails
    }
  })
  @ValidateNested()
  @Type(() => FilterBookingDto)
  filters?: FilterBookingDto | null;

  @ApiPropertyOptional({
    description: "Sorting options for the query (JSON string)",
    type: String,
  })
  @IsOptional()
  @Transform(({ value }) => {
    try {
      return value ? plainToInstance(SortBookingDto, JSON.parse(value)) : null;
    } catch (e) {
      return null; // Return null if JSON parsing fails
    }
  })
  @ValidateNested({ each: true })
  @Type(() => SortBookingDto)
  sort?: SortBookingDto[] | null;
}

export class BookedByMeFiltersDto {
  @ApiPropertyOptional({
    enum: BookingType,
    description: "Type of booking (service or tutor)",
  })
  @IsOptional()
  @IsEnum(BookingType)
  type?: BookingType;

  @ApiPropertyOptional({
    type: Date,
    description: "Date of the booking",
  })
  @IsOptional()
  @IsDate()
  date?: Date;

  @ApiPropertyOptional({
    type: String,
    description: "Start time of the booking (HH:mm)",
  })
  @IsOptional()
  @IsString()
  fromTime?: string;

  @ApiPropertyOptional({
    type: String,
    description: "End time of the booking (HH:mm)",
  })
  @IsOptional()
  @IsString()
  toTime?: string;

  @ApiPropertyOptional({
    enum: PaymentStatus,
    description: "Status of payment",
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiPropertyOptional({
    enum: BookingStatus,
    description: "Status of booking",
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @ApiPropertyOptional({
    type: () => User,
    description: "The tutor who was booked (if type is TUTOR)",
  })
  @IsOptional()
  @Type(() => User)
  tutor?: User;

  @ApiPropertyOptional({
    type: () => Service,
    description: "The service that was booked (if type is SERVICE)",
  })
  @IsOptional()
  @Type(() => Service)
  service?: Service;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  createdAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  updatedAt?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}

export class QueryBookingByMeDto {
  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 1))
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiPropertyOptional()
  @Transform(({ value }) => (value ? Number(value) : 10))
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) =>
    value ? plainToInstance(FilterBookingDto, JSON.parse(value)) : undefined
  )
  @ValidateNested()
  @Type(() => BookedByMeFiltersDto)
  filters?: BookedByMeFiltersDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value
      ? plainToInstance(SortBookingDto, JSON.parse(value))
      : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortBookingDto)
  sort?: SortBookingDto[] | null;
}
