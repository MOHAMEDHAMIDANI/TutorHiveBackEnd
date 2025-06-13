import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsBoolean, IsDate, IsDateString, IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MinLength, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';

export class AuthRegisterLoginDto {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;

  @ApiProperty({ example: '923009550284', type: String })
  // @IsPhoneNumber()
  @IsNotEmpty()
  phone: string;

  @ApiProperty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({example:true})
  @IsNotEmpty()
  sendVerification: boolean;

  @ApiProperty({example:"link|otp"})
  @IsNotEmpty()
  verificationType: string;

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  university?: string | null;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[] | null;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  goals?: string[] | null;
}

export class ResendConfirmationDTO{
  @ApiProperty({example:true})
  @IsNotEmpty()
  sendVerification: boolean;

  @ApiProperty({example:"link|otp"})
  @IsNotEmpty()
  verificationType: string;
}


export class AuthSocialConnectInput {
  @ApiProperty({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsEmail()
  email: string;



  @ApiProperty({ example: 'John' })
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: '1234567890', type: String })
  @IsNotEmpty()
  socialId: string;

  @ApiProperty({ example: 'google', type: String })
  @IsNotEmpty()
  provider: string;


}

export class TimeSlotDto {
  @ApiProperty({ example: '09:00' })
  @IsNotEmpty()
  @IsString()
  from: string;

  @ApiProperty({ example: '12:00' })
  @IsNotEmpty() 
  @IsString()
  to: string;
}

export class AvailableDayDto {
  @ApiProperty({ example: 'Monday', description: 'Day of the week' })
  @IsNotEmpty()
  @IsString()
  day: string;

  @ApiProperty({ 
    type: [TimeSlotDto],
    example: [
      { from: '09:00', to: '12:00' },
      { from: '14:00', to: '17:00' }
    ],
    description: 'Available time slots for this day'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayNotEmpty()
  timeSlots: TimeSlotDto[];

  @ApiProperty({ example: true })
  @IsBoolean()
  isAvailable: boolean;
}

export class UnavailableDateDto {
  @ApiProperty({ example: '2024-01-01', description: 'Date in YYYY-MM-DD format' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ 
    type: [TimeSlotDto],
    example: [
      { from: '09:00', to: '12:00' },
      { from: '14:00', to: '17:00' }
    ],
    description: 'Unavailable time slots for this date'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  @ArrayNotEmpty()
  timeSlots: TimeSlotDto[];
}

export class ApplyForTutorDTO {
  @ApiProperty({ example: 'Bachelor of Science in Mathematics' })
  @IsNotEmpty()
  qualification: string;

  @ApiProperty({ example: '5 years of teaching experience' })
  @IsNotEmpty()
  experience: string;

  @ApiProperty({ example: 50 })
  @IsNotEmpty()
  @IsNumber()
  hourlyRate: number;

  @ApiProperty({ type: [Number], example: [1, 2, 3] })
  @IsArray()
  @IsNumber({}, { each: true })
  @ArrayNotEmpty()
  services: number[];

  @ApiPropertyOptional({ type: String })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({
    type: [AvailableDayDto],
    example: [
      {
        day: 'Monday',
        timeSlots: [
          { from: '09:00', to: '12:00' },
          { from: '14:00', to: '17:00' }
        ],
        isAvailable: true
      },
      {
        day: 'Tuesday',
        timeSlots: [],
        isAvailable: false
      }
    ],
    description: 'Weekly schedule with available time slots'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AvailableDayDto)
  @ArrayNotEmpty()
  availableDays: AvailableDayDto[];

  @ApiProperty({
    type: [UnavailableDateDto],
    example: [
      {
        date: '2024-01-01',
        timeSlots: [
          { from: '09:00', to: '17:00' }
        ]
      }
    ],
    description: 'Specific dates with unavailable time slots'
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UnavailableDateDto)
  @ArrayNotEmpty()
  unavailableDates: UnavailableDateDto[];

  

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  subjects?: string[] | null;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  gradeLevels?: string[] | null;

  @ApiPropertyOptional({ type: String, isArray: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[] | null;


}