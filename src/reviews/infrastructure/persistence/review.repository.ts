import { User } from 'src/users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Review } from '../../domain/review';

import { FilterReviewDto, SortReviewDto } from '../../dto/query-review.dto';

export abstract class ReviewRepository {
  abstract create(
    data: Omit<Review, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Review>;

  

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterReviewDto | null;
    sortOptions?: SortReviewDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Review[]>;

  abstract findById(id: Review['id']): Promise<NullableType<Review>>;

  abstract findByUser(user: User['id']): Promise<NullableType<Review>>;

  abstract update(
    id: Review['id'],
    payload: Partial<
      Pick<
        Review,
        | 'knowledgeAndExpertise'
        | 'communicationSkills'
        | 'preparednessAndOrganization'
        | 'reliabilityAndPunctuality'
        | 'professionalism'
        | 'summary'
        | 'user'
        | 'service'
        | 'status'
      >
    >,
  ): Promise<Review>;

  abstract remove(id: Review['id']): Promise<void>;

  abstract findByUserId(userId: User['id']): Promise<Review[]>;

  abstract findByUserIds(userIds: User['id'][]): Promise<Review[]>;
}
