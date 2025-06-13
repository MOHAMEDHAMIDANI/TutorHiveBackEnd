import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, In, Like, Repository } from 'typeorm';
import { ServiceEntity } from '../entities/service.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterServiceDto, SortServiceDto } from '../../../../dto/query-service.dto';
import { Service } from '../../../../domain/service';

import { ServiceMapper } from '../mappers/service.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { ServiceRepository } from '../../service.repository';

@Injectable()
export class ServicesRelationalRepository implements ServiceRepository {
  constructor(
    @InjectRepository(ServiceEntity)
    private readonly servicesRepository: Repository<ServiceEntity>,
  ) {}

  async create(data: Service): Promise<Service> {
    const persistenceModel = ServiceMapper.toPersistence(data);
    const newEntity = await this.servicesRepository.save(
      this.servicesRepository.create(persistenceModel),
    );
    return ServiceMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterServiceDto | null;
    sortOptions?: SortServiceDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Service[]> {
    const where: FindOptionsWhere<ServiceEntity> = {};

    if (filterOptions) {
      if (filterOptions.title) {
        where.title = Like(`%${filterOptions.title}%`);
      }
      if (filterOptions.description) {
        where.description = Like(`%${filterOptions.title}%`);
      }
      if (filterOptions.price) {
        where.price = filterOptions.price;
      }
      if (filterOptions.user) {
        where.user = { id: Number(filterOptions.user.id) };
      }
      if (filterOptions.status) {
        where.status = { id: Number(filterOptions.status.id) };
      }
      if (filterOptions.createdAt) {
        where.createdAt = filterOptions.createdAt;
      }
      if (filterOptions.updatedAt) {
        where.updatedAt = filterOptions.updatedAt;
      }

      if (filterOptions.subjects) {
        where.subjects = In(filterOptions.subjects);
      }
      if (filterOptions.gradeLevels) {
        where.gradeLevels = In(filterOptions.gradeLevels);
      }
      if (filterOptions.locationType) {
        where.locationType = filterOptions.locationType;
      }
      if (filterOptions.minimumRating) {
        console.log("Unimplemented filter: minimumRating");
      }
    }

    const entities = await this.servicesRepository.find({
      skip: (paginationOptions.page - 1) * paginationOptions.limit,
      take: paginationOptions.limit,
      where: where,
      relations: {
        user: true,
        status: true,
        reviews: true,
      },
      order: sortOptions?.reduce(
        (accumulator, sort) => ({
          ...accumulator,
          [sort.orderBy]: sort.order,
        }),
        {},
      ),
    });

    return entities.map((service) => ServiceMapper.toDomain(service));
  }

  async findById(id: Service['id']): Promise<NullableType<Service>> {
    const entity = await this.servicesRepository.findOne({
      where: { id: Number(id) },
      relations: {
        user: true
      },
    });

    return entity ? ServiceMapper.toDomain(entity) : null;
  }

  async update(id: Service['id'], payload: Partial<Service>): Promise<Service> {
    const entity = await this.servicesRepository.findOne({
      where: { id: Number(id) },
    });

    if (!entity) {
      throw new Error('Service not found');
    }

    const updatedEntity = await this.servicesRepository.save(
      this.servicesRepository.create(
        ServiceMapper.toPersistence({
          ...ServiceMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    return ServiceMapper.toDomain(updatedEntity);
  }

  async remove(id: Service['id']): Promise<void> {
    await this.servicesRepository.softDelete(id);
  }
}
