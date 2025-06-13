import { Exclude, Expose } from 'class-transformer';
import { FileType } from '../../files/domain/file';
import { Role } from '../../roles/domain/role';
import { Status } from '../../statuses/domain/status';
import { ApiProperty } from '@nestjs/swagger';
import { Service } from 'src/services/domain/service';
import { Transaction } from 'src/transactions/domain/transaction';
import { AvailableDayDto, UnavailableDateDto } from 'src/auth/dto/auth-register-login.dto';
import { Booking } from 'src/bookings/domain/booking';
import { Review } from 'src/reviews/domain/review';
import { Job } from 'src/jobs/domain/job';

const idType = Number;

export class User {
  @ApiProperty({
    type: idType,
  })
  id: number | string;

  @ApiProperty({
    type: String,
    example: 'john.doe@example.com',
  })
  email: string | null;


  @ApiProperty({
    type: Number,
    example: '923009550284',
    nullable: true,
  })
  phone?: string | null;

  @Exclude({ toPlainOnly: true })
  verificationCode4?: Number | null;

  @ApiProperty({
    type: Number,
    example: '0000',
    nullable: true,
  })
  @Expose({ groups: ['me', 'admin', 'user'] })
  stepCode?: Number | null;

  @Exclude({ toPlainOnly: true })
  password?: string;

  @Exclude({ toPlainOnly: true })
  previousPassword?: string;

  @ApiProperty({
    type: String,
    example: 'email',
  })
  @Expose({ groups: ['me', 'admin'] })
  provider: string;

  @ApiProperty({
    type: String,
    example: '1234567890',
  })
  @Expose({ groups: ['me', 'admin'] })
  socialId?: string | null;

  @ApiProperty({
    type: String,
    example: 'John',
  })
  firstName: string | null;

  @ApiProperty({
    type: String,
    example: 'Doe',
  })
  lastName: string | null;

  @ApiProperty({
    type: () => FileType,
  })
  photo?: FileType | null;

  @ApiProperty({
    type: () => Role,
  })
  role?: Role | null;

  @ApiProperty({
    type: () => Status,
  })
  status?: Status;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  deletedAt: Date;

  @ApiProperty({
    type: () => Service,
  })
  services?: Service[];

  @ApiProperty({
    type: () => Review,
  })
  reviews_for_me?: Review[];

  @ApiProperty({
    type: () => Review,
  })
  reviews_by_me?: Review[];

  @ApiProperty({
    type: String,
    example: 'Bachelor of Science in Mathematics',
  })
  qualification?: string | null;

  @ApiProperty({
    type: String,
    example: '5 years of teaching experience',
  })
  experience?: string | null;

  @ApiProperty({
    type: Number,
    example: 50,
  })
  hourlyRate?: number | null;



  @ApiProperty({
    type: () => Transaction,
  })
  transactions?: Transaction[];
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
  unavailableDates?: UnavailableDateDto[] | null;

  @ApiProperty({
    type: () => Booking,
  })
  myBookings?: Booking[]; 

  @ApiProperty({
    type: () => Booking,
  })
  bookingsTutor?: Booking[];

  @ApiProperty({
    description: 'University or educational institution',
    example: 'University of California, Berkeley'
  })
  university?: string | null;

  @ApiProperty({
    description: 'Areas of interest or subjects',
    example: ['Mathematics', 'Computer Science', 'Physics'],
    isArray: true,
    type: String
  })
  interests?: string[] | null;

  @ApiProperty({
    description: 'Learning goals or objectives',
    example: ['Master calculus', 'Learn programming', 'Improve problem solving'],
    isArray: true,
    type: String
  })
  goals?: string[] | null;

  @ApiProperty({
    description: 'User tags or labels',
    example: ['Math Expert', 'Programming Tutor', 'Physics Enthusiast'],
    isArray: true,
    type: String
  })
  tags?: string[] | null;

  @ApiProperty({
    description: 'Teaching subjects',
    example: ['Calculus', 'Linear Algebra', 'Data Structures'],
    isArray: true,
    type: String
  })
  subjects?: string[] | null;

  @ApiProperty({
    description: 'Grade levels taught',
    example: ['High School', 'College', 'Graduate'],
    isArray: true,
    type: String
  })
  gradeLevels?: string[] | null;

  @ApiProperty({
    description: 'Service delivery location type',
    example: 'both',
    enum: ['online', 'offline', 'both'],
    type: String
  })
  locationType?: 'online' | 'offline' | 'both';

  @ApiProperty({
    type: () => Job,
    required: false,
    isArray: true,
    description: 'Jobs posted by this user'
  })
  jobs_by_me?: Job[];


  @ApiProperty({
    description: 'User description or bio',
    example: 'Experienced mathematics tutor with a passion for helping students understand complex concepts.',
    type: String
  })
  description?: string | null;
}
