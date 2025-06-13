import { User } from 'src/users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Job } from '../../domain/job';

import { FilterJobDto, SortJobDto } from '../../dto/query-job.dto';

export abstract class JobRepository {
  abstract create(
    data: Omit<Job, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Job>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterJobDto | null;
    sortOptions?: SortJobDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Job[]>;

  abstract findById(id: Job['id']): Promise<NullableType<Job>>;

  abstract findByUser(user: User['id']): Promise<NullableType<Job>>;

  abstract update(
    id: Job['id'],
    payload: Partial<
      Pick<
        Job,
        | 'title'
        | 'subject'
        | 'gradeLevel'
        | 'availableTimes'
        | 'tags'
        | 'description'
        | 'image'
        | 'locationType'
        | 'postedBy'
        | 'status'
      >
    >,
  ): Promise<Job>;

  abstract remove(id: Job['id']): Promise<void>;

}
