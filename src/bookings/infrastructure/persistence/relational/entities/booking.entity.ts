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
import { ServiceEntity } from '../../../../../services/infrastructure/persistence/relational/entities/service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsDate, IsNumber, IsOptional } from 'class-validator';
import { BookingType, PaymentStatus, BookingStatus } from '../../../../domain/booking';

@Entity({
  name: 'booking',
})
export class BookingEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    enum: BookingType,
    description: 'Type of booking (service or tutor)',
  })
  @IsEnum(BookingType)
  @Column({
    type: 'enum',
    enum: BookingType,
  })
  type: BookingType;

  @ApiProperty({
    type: Date,
    description: 'Date of the booking',
  })
  @IsDate()
  @Column('timestamp')
  date: Date;

  @ApiProperty({
    type: String,
    description: 'Start time of the booking (HH:mm)',
  })
  @Column()
  fromTime: string;

  @ApiProperty({
    type: String,
    description: 'End time of the booking (HH:mm)',
  })
  @Column()
  toTime: string;

  @ApiProperty({
    type: Number,
    description: 'Duration in minutes',
  })
  @IsNumber()
  @Column('int')
  duration: number;

  @ApiProperty({
    enum: PaymentStatus,
    description: 'Status of payment',
  })
  @IsEnum(PaymentStatus)
  @Column({
    type: 'enum',
    enum: PaymentStatus,
  })
  paymentStatus: PaymentStatus;

  @ApiProperty({
    enum: BookingStatus,
    description: 'Status of booking',
  })
  @IsEnum(BookingStatus)
  @Column({
    type: 'enum',
    enum: BookingStatus,
  })
  bookingStatus: BookingStatus;

  @ApiProperty({
    type: Number,
    description: 'Total amount for the booking',
  })
  @IsNumber()
  @Column('decimal', { precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The user who made the booking',
  })
  @ManyToOne(() => UserEntity, {
    eager: true,
  })
  bookedBy: UserEntity;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The tutor who was booked (if type is TUTOR)',
    required: false,
  })
  @IsOptional()
  @ManyToOne(() => UserEntity, {
    eager: true,
    nullable: true,
  })
  tutor?: UserEntity;

  @ApiProperty({
    type: () => ServiceEntity,
    description: 'The service that was booked (if type is SERVICE)',
    required: false,
  })
  @IsOptional()
  @ManyToOne(() => ServiceEntity, {
    eager: true,
    nullable: true,
  })
  service?: ServiceEntity;

  @ApiProperty({
    type: String,
    description: 'Any special notes or requirements',
    required: false,
  })
  @IsOptional()
  @Column({ type: String, nullable: true })
  notes?: string;

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
