import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FindOptionsWhere, In, Repository, ArrayContains, ILike } from 'typeorm';
import { UserEntity } from '../entities/user.entity';
import { NullableType } from '../../../../../utils/types/nullable.type';
import { FilterUserDto, SortUserDto } from '../../../../dto/query-user.dto';
import { User } from '../../../../domain/user';
import { UserRepository } from '../../user.repository';
import { UserMapper } from '../mappers/user.mapper';
import { IPaginationOptions } from '../../../../../utils/types/pagination-options';
import { UnavailableDateDto } from 'src/auth/dto/auth-register-login.dto';

@Injectable()
export class UsersRelationalRepository implements UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly usersRepository: Repository<UserEntity>,
  ) {}

  async create(data: User): Promise<User> {
    const persistenceModel = UserMapper.toPersistence(data);
    const newEntity = await this.usersRepository.save(
      this.usersRepository.create(persistenceModel),
    );
    return UserMapper.toDomain(newEntity);
  }

  async findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterUserDto | null;
    sortOptions?: SortUserDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<User[]> {
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    // Add necessary joins
    queryBuilder
      .leftJoinAndSelect('user.photo', 'photo')
      .leftJoinAndSelect('user.role', 'role')
      .leftJoinAndSelect('user.status', 'status')
      .leftJoin('user.reviews_for_me', 'reviews_for_me');

    // Apply raw SQL filters
    if (filterOptions) {
      const rawFilters: string[] = [];

      // Role filter
      if (filterOptions.roles?.length) {
        const roleIds = filterOptions.roles.map((role) => role.id);
        rawFilters.push(`(role.id IN (${roleIds.join(', ')}))`);
      }

      if (filterOptions.locationType) {
        rawFilters.push(`(user.locationType = '${filterOptions.locationType}')`);
      }
  
      // Subjects filter
      if (filterOptions.subjects?.length) {
        const subjects = filterOptions.subjects.map((s) => `'${s}'`).join(',');
        rawFilters.push(`(user.subjects && ARRAY[${subjects}]::varchar[])`);
      }
  
      // Grade levels filter
      if (filterOptions.gradeLevels?.length) {
        const gradeLevels = filterOptions.gradeLevels.map((g) => `'${g}'`).join(',');
        rawFilters.push(`(user.gradeLevels && ARRAY[${gradeLevels}]::varchar[])`);
      }
  
      // Tags filter
      if (filterOptions.tags?.length) {
        const tags = filterOptions.tags.map((t) => `'${t}'`).join(',');
        rawFilters.push(`(user.tags && ARRAY[${tags}]::varchar[])`);
      }
  
      // Available days filter
      if (filterOptions.availableDays?.length) {
        const availableDays = filterOptions.availableDays.map((d) => `'${d}'`).join(',');
        rawFilters.push(`(user.availableDays && ARRAY[${availableDays}]::varchar[])`);
      }
  
      // Unavailable dates filter
      if (filterOptions.unavailableDates?.length) {
        const unavailableDates = filterOptions.unavailableDates.map((d) => `'${d}'`).join(',');
        rawFilters.push(`(user.unavailableDates && ARRAY[${unavailableDates}]::date[])`);
      }
  
      // Text search filter
      if (filterOptions.search) {
        const search = filterOptions.search.replace(/'/g, "''"); // Escape single quotes
        rawFilters.push(`(
          user.firstName ILIKE '%${search}%' OR 
          user.lastName ILIKE '%${search}%' OR 
          user.email ILIKE '%${search}%'
        )`);
      }
  
      // Hourly rate filter
      if (filterOptions.hourlyRate !== null && filterOptions.hourlyRate !== undefined) {
        rawFilters.push(`(user.hourlyRate = ${filterOptions.hourlyRate})`);
      }

      // Rating filter
      if (filterOptions.rating !== null && filterOptions.rating !== undefined) {
        rawFilters.push(`(
          (
            SELECT AVG(
              (reviews_for_me.knowledgeAndExpertise +
              reviews_for_me.communicationSkills +
              reviews_for_me.preparednessAndOrganization +
              reviews_for_me.reliabilityAndPunctuality +
              reviews_for_me.professionalism) / 5.0
            )
            FROM user_reviews_for_me reviews_for_me
            WHERE reviews_for_me.userId = user.id
          ) >= ${filterOptions.rating}
        )`);
      }

      // Has reviews filter
      if (filterOptions.hasReviews !== null && filterOptions.hasReviews !== undefined) {
        if (filterOptions.hasReviews) {
          rawFilters.push(`(
            EXISTS (SELECT 1 FROM user_reviews_for_me reviews_for_me WHERE reviews_for_me.userId = user.id)
          )`);
        } else {
          rawFilters.push(`(
            NOT EXISTS (SELECT 1 FROM user_reviews_for_me reviews_for_me WHERE reviews_for_me.userId = user.id)
          )`);
        }
      }

      // Combine all filters with AND
      if (rawFilters.length) {
        queryBuilder.andWhere(`(${rawFilters.join(') AND (')})`);
      }
    }

    // Add sorting
    if (sortOptions?.length) {
      sortOptions.forEach((sort) => {
        queryBuilder.addOrderBy(`user.${sort.orderBy}`, sort.order.toUpperCase() as 'ASC' | 'DESC');
      });
    }

    // Add pagination
    queryBuilder
      .skip((paginationOptions.page - 1) * paginationOptions.limit)
      .take(paginationOptions.limit);

    // Log the generated SQL query and parameters for debugging
    const finalQuery = queryBuilder.getSql();
    const queryParams = queryBuilder.getParameters();
    console.log('Generated SQL Query:', finalQuery);
    console.log('Query Parameters:', queryParams);

    // Execute the query
    const entities = await queryBuilder.getMany();
    
    // Map entities to domain objects
    return entities.map((user) => UserMapper.toDomain(user));
  }



  async findById(id: User['id']): Promise<NullableType<User>> {
    console.log("debu 1")
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
      relations: {
        services: true,
        reviews_for_me: {
          user: true,
          reviewedBy: true,
          service: true,
          status: true
        },
        reviews_by_me: {
          user: true,
          reviewedBy: true,
          service: true,
          status: true
        }
      },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findByEmail(email: User['email']): Promise<NullableType<User>> {
    if (!email) return null;

    const entity = await this.usersRepository.findOne({
      where: { email },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async findBySocialIdAndProvider({
    socialId,
    provider,
  }: {
    socialId: User['socialId'];
    provider: User['provider'];
  }): Promise<NullableType<User>> {
    if (!socialId || !provider) return null;

    const entity = await this.usersRepository.findOne({
      where: { socialId, provider },
    });

    return entity ? UserMapper.toDomain(entity) : null;
  }

  async update(id: User['id'], payload: Partial<User>): Promise<User> {
    console.log("DEBUG: Starting update in repository", { id, payload });
    
    const entity = await this.usersRepository.findOne({
      where: { id: Number(id) },
    });

    console.log("DEBUG: Found entity", { entity });

    if (!entity) {
      console.log("DEBUG: Entity not found");
      throw new Error('User not found');
    }

    console.log("DEBUG: Creating updated entity");
    const updatedEntity = await this.usersRepository.save(
      this.usersRepository.create(
        UserMapper.toPersistence({
          ...UserMapper.toDomain(entity),
          ...payload,
        }),
      ),
    );

    console.log("DEBUG: Successfully updated entity", { updatedEntity });

    return UserMapper.toDomain(updatedEntity);
  }

  async remove(id: User['id']): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async markAsBusy(markAsBusy: UnavailableDateDto, tutorId: User['id']): Promise<void> {
    // const user = await this.usersRepository.findOne({ where: { id: Number(tutorId) } });
    // const updatedDates = [...(user?.unavailableDates || []), markAsBusy.date.toString()];
    // await this.usersRepository.update(tutorId, { unavailableDates: updatedDates });
  }
}
