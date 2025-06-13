import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { BidEntity } from '../entities/bid.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterBidDto, SortBidDto } from '../../../../dto/query-bid.dto';
import { Bid } from '../../../../domain/bid';

import { BidMapper } from '../mappers/bid.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { BidRepository } from '../../bid.repository';
import { User } from 'src/users/domain/user';
import { JobEntity } from 'src/jobs/infrastructure/persistence/relational/entities/job.entity';

@Injectable()
export class BidsRelationalRepository implements BidRepository {
  constructor(
    @InjectRepository(BidEntity)
    private readonly bidsRepository: Repository<BidEntity>,
  ) {}

  async create(data: Bid): Promise<Bid> {
    const persistenceModel = BidMapper.toPersistence(data);
    const newEntity = await this.bidsRepository.save(
      this.bidsRepository.create(persistenceModel),
    );
    return BidMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterBidDto | null;
    sortOptions?: SortBidDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Bid[]> {

    console.log("Filter options", filterOptions)
    console.log("Sort options", sortOptions)
    console.log("Pagination options", paginationOptions)

    console.log("Then it crashed")
    const where: FindOptionsWhere<BidEntity> = {};

    if (filterOptions) {
      if (filterOptions.price) {
        where.price = filterOptions.price;
      }
      if (filterOptions.status) {
        where.status = filterOptions.status;
      }
      if (filterOptions.proposal) {
        where.proposal = Like(`%${filterOptions.proposal}%`);
      }
      if (filterOptions.tutor) {
        where.tutor = { id: Number(filterOptions.tutor.id) };
      }
      if (filterOptions.jobId) {
        const jobE:JobEntity = new JobEntity()
        jobE.id = Number(filterOptions.jobId)
        where.job = jobE;
        
      }
    }
    console.log("Where", where)

    const entities = await this.bidsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations: {
        tutor: true,
      },
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    return entities.map((bid) => BidMapper.toDomain(bid));
  }

  async findByUser(user: User['id']): Promise<NullableType<Bid>> {
    const entity = await this.bidsRepository.findOne({
      where: { tutor: { id: Number(user) } },
    });
    return entity ? BidMapper.toDomain(entity) : null;
  }

  async findById(id: Bid['id']): Promise<NullableType<Bid>> {
    const entity = await this.bidsRepository.findOne({
      where: { id: Number(id) },
      relations: {
        tutor: true,
      }
    });

    return entity ? BidMapper.toDomain(entity) : null;
  }

  async update(id: Bid['id'], payload: Partial<Bid>): Promise<Bid> {
    const entity = await this.bidsRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Bid not found');
    }

    const updatedEntity = await this.bidsRepository.save(
      this.bidsRepository.create(
        BidMapper.toPersistence({
          ...BidMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return BidMapper.toDomain(updatedEntity);
  }

  async remove(id: Bid['id']): Promise<void> {
    await this.bidsRepository.softDelete(id);
  }
}
