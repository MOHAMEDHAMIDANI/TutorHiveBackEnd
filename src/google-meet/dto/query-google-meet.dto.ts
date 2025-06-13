import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
  IsDate,
} from 'class-validator';
import { Transform, Type, plainToInstance } from 'class-transformer';
import { GoogleMeet } from '../domain/google-meet';
import { User } from '../../users/domain/user';
import { Booking } from '../../bookings/domain/booking';

export class FilterGoogleMeetDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  startTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDate()
  endTime?: Date;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  organizer?: User;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => User)
  attendee?: User;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Booking)
  booking?: Booking;

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

export class SortGoogleMeetDto {
  @ApiProperty()
  @Type(() => String)
  @IsString()
  orderBy: keyof GoogleMeet;

  @ApiProperty()
  @IsString()
  order: string;
}

export class QueryGoogleMeetDto {
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
    value ? plainToInstance(FilterGoogleMeetDto, JSON.parse(value)) : undefined,
  )
  @ValidateNested()
  @Type(() => FilterGoogleMeetDto)
  filters?: FilterGoogleMeetDto | null;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @Transform(({ value }) => {
    return value ? plainToInstance(SortGoogleMeetDto, JSON.parse(value)) : undefined;
  })
  @ValidateNested({ each: true })
  @Type(() => SortGoogleMeetDto)
  sort?: SortGoogleMeetDto[] | null;
} 