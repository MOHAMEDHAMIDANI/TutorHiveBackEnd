import { User } from 'src/users/domain/user';
import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Bid } from '../../domain/bid';
import { Job } from '../../../jobs/domain/job';

import { FilterBidDto, SortBidDto } from '../../dto/query-bid.dto';

export abstract class BidRepository {
  abstract create(
    data: Omit<Bid, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Bid>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBidDto | null;
    sortOptions?: SortBidDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Bid[]>;

  abstract findById(id: Bid['id']): Promise<NullableType<Bid>>;

  abstract findByUser(user: User['id']): Promise<NullableType<Bid>>;

  abstract update(
    id: Bid['id'],
    payload: Partial<
      Pick<
        Bid,
        | 'price'
        | 'job'
        | 'tutor'
        | 'status'
        | 'proposal'
      >
    >,
  ): Promise<Bid>;

  abstract remove(id: Bid['id']): Promise<void>;
}
