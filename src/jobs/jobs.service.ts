import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterJobDto, SortJobDto } from './dto/query-job.dto';
import { JobRepository } from './infrastructure/persistence/job.repository';
import { Job, JobStatusEnum } from './domain/job';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { JobEntity } from './infrastructure/persistence/relational/entities/job.entity';

@Injectable()
export class JobsService {
  constructor(
    private readonly jobsRepository: JobRepository,
    private readonly usersService: UsersService
  ) {}

  async create(createJobDto: CreateJobDto, user: JwtPayloadType): Promise<Job> {
    const userObject = await this.usersService.findById(user.id);

    if (!userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    const postedByUser = new UserEntity();
    postedByUser.id = Number(user.id);

    const job = new JobEntity();
    job.title = createJobDto.title;
    job.subject = createJobDto.subject;
    job.gradeLevel = createJobDto.gradeLevel;
    job.availableTimes = createJobDto.availableTimes;
    job.tags = createJobDto.tags;
    job.description = createJobDto.description;
    job.image = createJobDto.image;
    job.locationType = createJobDto.locationType || 'online';
    job.postedBy = postedByUser;
    job.status = createJobDto.status || JobStatusEnum.new;

    return this.jobsRepository.create(job);
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterJobDto | null;
    sortOptions?: SortJobDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Job[]> {
    return this.jobsRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Job['id']): Promise<NullableType<Job>> {
    return this.jobsRepository.findById(id);
  }

  async update(
    id: Job['id'],
    updateJobDto: DeepPartial<Job>,
    user: JwtPayloadType,
  ): Promise<Job> {
    const job = await this.jobsRepository.findById(id);
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }


    if (job.postedBy.id !== user.id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'notAuthorized',
        },
      });
    }

    const updatePayload = {
      title: updateJobDto.title,
      subject: updateJobDto.subject,
      gradeLevel: updateJobDto.gradeLevel,
      availableTimes: updateJobDto.availableTimes?.filter((time): time is string => time !== undefined),
      tags: updateJobDto.tags?.filter((tag): tag is string => tag !== undefined),
      description: updateJobDto.description,
      image: updateJobDto.image,
      locationType: updateJobDto.locationType !== undefined ? updateJobDto.locationType : job.locationType,
      status: updateJobDto.status,
    };

    return this.jobsRepository.update(id, updatePayload);
  }

  async remove(id: Job['id']): Promise<void> {
    const job = await this.jobsRepository.findById(id);
    
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    await this.jobsRepository.remove(id);
  }

  async getOne(id: Job['id']): Promise<Job> {
    const job = await this.jobsRepository.findById(id);

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

}
