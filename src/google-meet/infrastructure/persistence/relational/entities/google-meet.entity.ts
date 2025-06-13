import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { BookingEntity } from '../../../../../bookings/infrastructure/persistence/relational/entities/booking.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsOptional, IsString, IsUrl } from 'class-validator';

@Entity({
  name: 'google_meet',
})
export class GoogleMeetEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    description: 'Title of the Google Meet session',
    example: 'Math Tutoring Session'
  })
  @Column()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Description of the Google Meet session',
    example: 'Session to discuss calculus problems'
  })
  @Column('text')
  description: string;

  @ApiProperty({
    type: Date,
    description: 'Start time of the Google Meet session',
  })
  @IsDate()
  @Column('timestamp')
  startTime: Date;

  @ApiProperty({
    type: Date,
    description: 'End time of the Google Meet session',
  })
  @IsDate()
  @Column('timestamp')
  endTime: Date;

  @ApiProperty({
    type: String,
    description: 'Google Meet URL',
  })
  @IsUrl()
  @Column()
  meetUrl: string;

  @ApiProperty({
    type: String,
    description: 'Google Calendar Event ID',
  })
  @IsString()
  @Column()
  calendarEventId: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The organizer of the Google Meet session',
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  organizer: UserEntity;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The attendee of the Google Meet session',
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  attendee: UserEntity;

  @ApiProperty({
    type: () => BookingEntity,
    description: 'The associated booking',
    required: false,
  })
  @IsOptional()
  @ManyToOne(() => BookingEntity, {
    eager: true,
    nullable: true,
  })
  booking?: BookingEntity;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;
} 