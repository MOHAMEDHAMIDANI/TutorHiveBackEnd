import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { StatusEntity } from '../../../../../statuses/infrastructure/persistence/relational/entities/status.entity';
import { EntityRelationalHelper } from '../../../../../utils/relational-entity-helper';
import { UserEntity } from '../../../../../users/infrastructure/persistence/relational/entities/user.entity';
import { ServiceEntity } from '../../../../../services/infrastructure/persistence/relational/entities/service.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, Min, Max } from 'class-validator';
import { JobStatusEnum } from 'src/jobs/domain/job';

@Entity({
  name: 'job',
})
export class JobEntity extends EntityRelationalHelper {
  @ApiProperty({
    type: Number,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    type: String,
    description: 'Title of the job',
    example: 'Math Tutoring Session'
  })
  @Column()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Subject area',
    example: 'Mathematics'
  })
  @Column()
  subject: string;


  @ApiProperty({
    type: String,
    description: 'Grade/education level',
    example: 'University - First Year'
  })
  @Column()
  gradeLevel: string;

  @ApiProperty({
    type: [String],
    description: 'Available time slots',
    example: ['Monday 2-4pm', 'Wednesday 3-5pm']
  })
  @Column('simple-array')
  availableTimes: string[];

  @ApiProperty({
    type: [String],
    description: 'Tags for the job',
    example: ['calculus', 'derivatives', 'math help']
  })
  @Column('simple-array')
  tags: string[];

  @ApiProperty({
    type: String,
    description: 'Detailed description of job',
    example: 'Looking for help understanding derivatives and integrals for upcoming exam'
  })
  @Column('text')
  description: string;

  @ApiProperty({
    type: String,
    description: 'URL to uploaded image',
    required: false
  })
  @IsOptional()
  @Column({ nullable: true })
  image?: string;

  @ApiProperty({
    type: String,
    description: 'Preferred location type',
    example: 'online',
    enum: ['online', 'offline', 'both']
  })
  @Column({ nullable: true, default: 'online' })
  locationType: string;

  @ApiProperty({
    type: () => UserEntity,
    description: 'The user who posted the job',
  })
  @ManyToOne(() => UserEntity, (user) => user.jobs_by_me)
  postedBy: UserEntity;


  @ApiProperty({
    type: String,
    description: 'Status of the job',
    enum: ['new', 'active', 'closed']
  })
  @Column({
    type: 'enum',
    enum: JobStatusEnum,
    default: JobStatusEnum.new
  })
  status: JobStatusEnum;

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
