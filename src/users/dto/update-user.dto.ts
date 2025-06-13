import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

import { Transform, Type } from 'class-transformer';
import { IsEmail, IsOptional, IsPhoneNumber, IsString, MinLength, IsNumber, IsArray, ValidateNested, ArrayNotEmpty, IsBoolean, IsDateString } from 'class-validator';
import { FileDto } from '../../files/dto/file.dto';
import { RoleDto } from '../../roles/dto/role.dto';
import { StatusDto } from '../../statuses/dto/status.dto';
import { lowerCaseTransformer } from '../../utils/transformers/lower-case.transformer';
import { AvailableDayDto, UnavailableDateDto } from 'src/auth/dto/auth-register-login.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiPropertyOptional({ example: 'test1@example.com', type: String })
  @Transform(lowerCaseTransformer)
  @IsOptional()
  @IsEmail()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ example: '923009550284', type: String })
  // @IsPhoneNumber()
  @IsOptional()
  phone: string;

  provider?: string;

  socialId?: string | null;

  @ApiPropertyOptional({ example: 'John', type: String })
  @IsOptional()
  firstName?: string | null;

  @ApiPropertyOptional({ example: 'Doe', type: String })
  @IsOptional()
  lastName?: string | null;

  @ApiPropertyOptional({ type: () => FileDto })
  @IsOptional()
  photo?: FileDto | null;

  @ApiPropertyOptional({ type: () => RoleDto })
  @IsOptional()
  @Type(() => RoleDto)
  role?: RoleDto | null;

  @ApiPropertyOptional({ type: () => StatusDto })
  @IsOptional()
  @Type(() => StatusDto)
  status?: StatusDto;

  stepCode?: number | null;

  hash?: string | null;

  @ApiPropertyOptional({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  locationType?: 'online' | 'offline' | 'both';

  @ApiPropertyOptional({
    type: String,
    example: 'University of Example',
    description: 'User\'s university or educational institution'
  })
  @IsOptional()
  @IsString()
  university?: string | null;

  @ApiPropertyOptional({
    type: [String],
    example: ['Mathematics', 'Physics', 'Programming'],
    description: 'User\'s interests and hobbies'
  })
  @IsOptional()
  @IsString({ each: true })
  interests?: string[] | null;

  @ApiPropertyOptional({
    type: [String], 
    example: ['Complete Masters Degree', 'Learn New Programming Languages'],
    description: 'User\'s academic or professional goals'
  })
  @IsOptional()
  @IsString({ each: true })
  goals?: string[] | null;

  @ApiPropertyOptional({ type: String, description: 'User description or bio' })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional({ example: 'Bachelor of Science in Mathematics' })
  @IsOptional()
  qualification?: string;

  @ApiPropertyOptional({ example: '5 years of teaching experience' })
  @IsOptional()
  experience?: string;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  @IsNumber()
  hourlyRate?: number;


  @ApiPropertyOptional({
    type: [AvailableDayDto],
    example: [
      {
        day: 'Monday',
        timeSlots: [
          { from: '09:00', to: '12:00' },
          { from: '14:00', to: '17:00' }
        ],
        isAvailable: true
      }
    ]
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => AvailableDayDto)
  availableDays?: AvailableDayDto[];

  @ApiPropertyOptional({
    type: [UnavailableDateDto],
    example: [
      {
        date: '2024-01-01',
        timeSlots: [
          { from: '09:00', to: '17:00' }
        ]
      }
    ]
  })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UnavailableDateDto)
  unavailableDates?: UnavailableDateDto[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  subjects?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  gradeLevels?: string[] | null;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[] | null;
}
