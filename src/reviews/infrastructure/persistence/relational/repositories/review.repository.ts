import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, Like, Repository } from 'typeorm';
import { ReviewEntity } from '../entities/review.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterReviewDto, SortReviewDto } from '../../../../dto/query-review.dto';
import { Review } from '../../../../domain/review';

import { ReviewMapper } from '../mappers/review.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { ReviewRepository } from '../../review.repository';
import { User } from 'src/users/domain/user';

@Injectable()
export class ReviewsRelationalRepository implements ReviewRepository {
  constructor(
    @InjectRepository(ReviewEntity)
    private readonly reviewsRepository: Repository<ReviewEntity>,
  ) {}

  async create(data: Review): Promise<Review> {
    const persistenceModel = ReviewMapper.toPersistence(data);
    const newEntity = await this.reviewsRepository.save(
      this.reviewsRepository.create(persistenceModel),
    );
    return ReviewMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterReviewDto | null;
    sortOptions?: SortReviewDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Review[]> {
    const where: FindOptionsWhere<ReviewEntity> = {};

    if (filterOptions) {
      if (filterOptions.knowledgeAndExpertise) {
        where.knowledgeAndExpertise = filterOptions.knowledgeAndExpertise;
      }
      if (filterOptions.communicationSkills) {
        where.communicationSkills = filterOptions.communicationSkills;
      }
      if (filterOptions.preparednessAndOrganization) {
        where.preparednessAndOrganization = filterOptions.preparednessAndOrganization;
      }
      if (filterOptions.reliabilityAndPunctuality) {
        where.reliabilityAndPunctuality = filterOptions.reliabilityAndPunctuality;
      }
      if (filterOptions.professionalism) {
        where.professionalism = filterOptions.professionalism;
      }
      if (filterOptions.user) {
        where.user = { id: Number(filterOptions.user.id) };
      }
      if (filterOptions.service) {
        where.service = { id: Number(filterOptions.service.id) };
      }
      if (filterOptions.status) {
        where.status = { id: Number(filterOptions.status.id) };
      }
    }

    const entities = await this.reviewsRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations:{
        user: true,
      },
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    return entities.map((review) => ReviewMapper.toDomain(review));
  }

  async findByUser(user: User['id']): Promise<NullableType<Review>> {
    const entity = await this.reviewsRepository.findOne({
      where: { reviewedBy: { id: Number(user) } },
    });
    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async findById(id: Review['id']): Promise<NullableType<Review>> {
    const entity = await this.reviewsRepository.findOne({
      where: { id: Number(id) },
    });

    return entity ? ReviewMapper.toDomain(entity) : null;
  }

  async update(id: Review['id'], payload: Partial<Review>): Promise<Review> {
    const entity = await this.reviewsRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Review not found');
    }

    const updatedEntity = await this.reviewsRepository.save(
      this.reviewsRepository.create(
        ReviewMapper.toPersistence({
          ...ReviewMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ReviewMapper.toDomain(updatedEntity);
  }

  async remove(id: Review['id']): Promise<void> {
    await this.reviewsRepository.softDelete(id);
  }

  async findByUserId(userId: User['id']): Promise<Review[]> {
    const entities = await this.reviewsRepository.find({
      where: { user: { id: Number(userId) } },
      // select:{}
      // relations:{
      //   user: true,
      //   service: true,
      // }
    });

    return entities.map((review) => ReviewMapper.toDomain(review));
  }

  async findByUserIds(userIds: User['id'][]): Promise<Review[]> {
    const entities = await this.reviewsRepository.find({
      where: userIds.map((id) => ({ user: { id: Number(id) } })),
      // relations:{
      //   user: true,
      //   service: true,
      // }
    });

    return entities.map((review) => ReviewMapper.toDomain(review));
  }

}
