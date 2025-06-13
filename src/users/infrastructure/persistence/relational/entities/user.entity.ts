import {
  Column,
  AfterLoad,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  JoinColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';

import { AuthProvidersEnum } from '../../../../../auth/auth-providers.enum';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';

// We use class-transformer in ORM entity and domain entity.
// We duplicate these rules because you can choose not to use adapters
// in your project and return an ORM entity directly in response.
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ServiceEntity } from 'src/services/infrastructure/persistence/relational/entities/service.entity';
import { Service } from 'src/services/domain/service';
import { FileEntity } from 'src/files/infrastructure/persistence/relational/entities/file.entity';
import { RoleEntity } from 'src/roles/infrastructure/persistence/relational/entities/role.entity';
import { StatusEntity } from 'src/statuses/infrastructure/persistence/relational/entities/status.entity';
import { AvailableDayDto, UnavailableDateDto } from 'src/auth/dto/auth-register-login.dto';
import { BookingEntity } from 'src/bookings/infrastructure/persistence/relational/entities/booking.entity';
import { ReviewEntity } from 'src/reviews/infrastructure/persistence/relational/entities/review.entity';
import { JobEntity } from 'src/jobs/infrastructure/persistence/relational/entities/job.entity';

@Entity({
  name: 'user',
})
export class UserEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  // For "string | null" we need to use String type.
  // More info: https://github.com/typeorm/typeorm/issues/2567
  @Column({ type: String, unique: true, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  email: string | null;

  @Column({ nullable: true })
  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  public previousPassword?: string;

  @AfterLoad()
  public loadPreviousPassword(): void {
    this.previousPassword = this.password;
  }

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Column({ default: AuthProvidersEnum.email })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Index()
  @Column({ type: String, nullable: true })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;


  @ApiProperty({
    type: Number,
    example: '1234567890',
  })
  @Index()
  @Column({ type: String, nullable: true })
  @Expose({ groups: ['me', 'admin', 'user'] })
  phone: string | null;

  // @ApiProperty({
  //   type: Number,
  //   example: '1234567890',
  // })
  // @Expose({ groups: ['me', 'admin', 'user'] })
  @Column({type:Number, nullable: true})
  verificationCode4: Number;

  @ApiProperty({
    type: Number,
    example: '1234',
  })
  @Column({type:Number, nullable: true})
  @Expose({ groups: ['me', 'admin', 'user'] })
  stepCode: Number;
  @ApiProperty({
    type: String,
    example: 'John',
  })
  @Index()
  @Column({ type: String, nullable: true })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  @Index()
  @Column({ type: String, nullable: true })
  lastName: string | null;

  @ApiProperty({
    type: () => FileEntity,
  })
  @OneToOne(() => FileEntity, {
    eager: true,
  })
  @JoinColumn()
  photo?: FileEntity | null;

  @ApiProperty({
    type: () => RoleEntity,
  })
  @ManyToOne(() => RoleEntity, {
    eager: true,
  })
  role?: RoleEntity | null;

  @ApiProperty({
    type: () => StatusEntity,
  })
  @ManyToOne(() => StatusEntity, {
    eager: true,
  })
  status?: StatusEntity;

  @ApiProperty()
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty()
  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty()
  @DeleteDateColumn()
  deletedAt: Date;

  @ApiProperty({
    type: () => Service,
  })
  @OneToMany(() => ServiceEntity, (service) => service.user)
  @JoinColumn()
  services?: ServiceEntity[];

  @ApiProperty({
    type: String,
    example: 'Bachelor of Science in Mathematics',
  })
  @Column({ type: String, nullable: true })
  qualification?: string | null;

  @ApiProperty({
    type: String,
    example: '5 years of teaching experience',
  })
  @Column({ type: String, nullable: true })
  experience?: string | null;

  @ApiProperty({
    type: Number,
    example: 50,
  })
  @Column({ type: Number, nullable: true })
  hourlyRate?: number | null;

  @ApiProperty({
    type: String,
    example: 'I am a qualified teacher with 5 years of experience',
  })
  @Column({ type: String, nullable: true })
  justification?: string | null;

  @ApiProperty({
    type: String,
    example: 'I am a qualified teacher with 5 years of experience',
  })
  @Column({ type: String, nullable: true })
  justification2?: string | null;

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
  @Column({ type: 'jsonb', nullable: true })
  availableDays?: AvailableDayDto[] | null;

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
  @Column({ type: 'jsonb', nullable: true })
  unavailableDates?: UnavailableDateDto[] | null;

  @ApiProperty({
    type: () => BookingEntity,
  })
  @JoinColumn()
  @OneToMany(() => BookingEntity, (booking) => booking.bookedBy)
  myBookings?: BookingEntity[];

  @ApiProperty({
    type: () => BookingEntity,
  })
  @JoinColumn()
  @OneToMany(() => BookingEntity, (booking) => booking.tutor)
  bookingsTutor?: BookingEntity[];

  @ApiProperty({
    description: 'University or educational institution',
    example: 'University of California, Berkeley'
  })
  @Column({ type: String, nullable: true })
  university?: string | null;

  @ApiProperty({
    description: 'Areas of interest or subjects',
    example: ['Mathematics', 'Computer Science', 'Physics'],
    isArray: true,
    type: String
  })
  @Column('text', { array: true, nullable: true })
  interests?: string[] | null;

  @ApiProperty({
    description: 'Learning goals or objectives',
    example: ['Master calculus', 'Learn programming', 'Improve problem solving'],
    isArray: true,
    type: String
  })
  @Column('text', { array: true, nullable: true })
  goals?: string[] | null;

  @ApiProperty({
    type: () => ReviewEntity,
  })
  @OneToMany(() => ReviewEntity, (review) => review.user)
  reviews_for_me?: ReviewEntity[];

  @ApiProperty({
    type: () => ReviewEntity,
  })
  @OneToMany(() => ReviewEntity, (review) => review.reviewedBy)
  reviews_by_me?: ReviewEntity[];

  @ApiProperty({
    description: 'Learning goals or objectives',
    example: ['Master calculus', 'Learn programming', 'Improve problem solving'],
    isArray: true,
    type: String
  })
  @Column('text', { array: true, nullable: true })
  goalsf?: string[] | null;

  @ApiProperty({
    description: 'User tags or labels',
    example: ['Math Expert', 'Programming Tutor', 'Physics Enthusiast'],
    isArray: true,
    type: String
  })
  @Column('text', { array: true, nullable: true })
  tags?: string[] | null;

  @ApiProperty({
    description: 'Teaching subjects',
    example: ['Calculus', 'Linear Algebra', 'Data Structures'],
    isArray: true,
    type: String
  })
  @Column('text', { array: true, nullable: true })
  subjects?: string[] | null;

  @ApiProperty({
    description: 'Grade levels taught',
    example: ['High School', 'College', 'Graduate'],
    isArray: true,
    type: String
  })
  @Column('text', { array: true, nullable: true })
  gradeLevels?: string[] | null;

  @ApiProperty({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  locationType?: 'online' | 'offline' | 'both';

  @ApiProperty({
    type: () => JobEntity,
    required: false,
    isArray: true,
    description: 'Jobs posted by this user'
  })
  @OneToMany(() => JobEntity, (job) => job.postedBy)
  jobs_by_me?: JobEntity[];

  @ApiProperty({
    type: String,
    description: 'User description or bio'
  })
  @Column({ type: String, nullable: true })
  description?: string | null;
}
