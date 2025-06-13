import { DeepPartial } from '../../../utils/types/deep-partial.type';
import { NullableType } from '../../../utils/types/nullable.type';
import { IPaginationOptions } from '../../../utils/types/pagination-options';
import { Service } from '../../domain/service';

import { FilterServiceDto, SortServiceDto } from '../../dto/query-service.dto';

export abstract class ServiceRepository {
  abstract create(
    data: Omit<Service, 'id' | 'createdAt' | 'deletedAt' | 'updatedAt'>,
  ): Promise<Service>;

  abstract findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterServiceDto | null;
    sortOptions?: SortServiceDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Service[]>;

  abstract findById(id: Service['id']): Promise<NullableType<Service>>;

  abstract update(
    id: Service['id'],
    payload: Partial<
      Pick<Service, 'title' | 'image' | 'description' | 'price' | 'user' | 'status'>
    >,
  ): Promise<Service>;

  abstract remove(id: Service['id']): Promise<void>;
}
