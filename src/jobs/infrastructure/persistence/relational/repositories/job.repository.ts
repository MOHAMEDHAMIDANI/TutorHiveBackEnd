import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ArrayContains, FindOptionsWhere, Like, Repository } from 'typeorm';
import { JobEntity } from '../entities/job.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterJobDto, SortJobDto } from '../../../../dto/query-job.dto';
import { Job } from '../../../../domain/job';

import { JobMapper } from '../mappers/job.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { JobRepository } from '../../job.repository';
import { User } from 'src/users/domain/user';

@Injectable()
export class JobsRelationalRepository implements JobRepository {
  constructor(
    @InjectRepository(JobEntity)
    private readonly jobsRepository: Repository<JobEntity>,
  ) {}

  async create(data: Job): Promise<Job> {
    const persistenceModel = JobMapper.toPersistence(data);
    const newEntity = await this.jobsRepository.save(
      this.jobsRepository.create(persistenceModel),
    );
    return JobMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterJobDto | null;
    sortOptions?: SortJobDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Job[]> {
    const where: FindOptionsWhere<JobEntity> = {};

    if (filterOptions) {
      if (filterOptions.title) {
        where.title = Like(`%${filterOptions.title}%`);
      }
      if (filterOptions.subject) {
        where.subject = Like(`%${filterOptions.subject}%`);
      }
      if (filterOptions.gradeLevel) {
        where.gradeLevel = filterOptions.gradeLevel;
      }
      
      if (filterOptions.tags) {
        where.tags = ArrayContains(filterOptions.tags);
      }
      if (filterOptions.description) {
        where.description = Like(`%${filterOptions.description}%`);
      }
      if (filterOptions.postedBy) {
        where.postedBy = { id: Number(filterOptions.postedBy.id) };
      }
      if (filterOptions.status) {
        where.status = filterOptions.status;
      }
    }

    const entities = await this.jobsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations: {
        postedBy: true,
      },
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    return entities.map((job) => JobMapper.toDomain(job));
  }

  async findByUser(user: User['id']): Promise<NullableType<Job>> {
    const entity = await this.jobsRepository.findOne({
      where: { postedBy: { id: Number(user) } },
    });
    return entity ? JobMapper.toDomain(entity) : null;
  }

  async findById(id: Job['id']): Promise<NullableType<Job>> {
    const entity = await this.jobsRepository.findOne({
      where: { id: Number(id) },
      relations: {
        postedBy: true,
      },
    });

    return entity ? JobMapper.toDomain(entity) : null;
  }

  async update(id: Job['id'], payload: Partial<Job>): Promise<Job> {
    const entity = await this.jobsRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Job not found');
    }

    const updatedEntity = await this.jobsRepository.save(
      this.jobsRepository.create(
        JobMapper.toPersistence({
          ...JobMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return JobMapper.toDomain(updatedEntity);
  }

  async remove(id: Job['id']): Promise<void> {
    await this.jobsRepository.softDelete(id);
  }

}
