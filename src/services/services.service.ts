import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterServiceDto, SortServiceDto } from './dto/query-service.dto';
import { ServiceRepository } from './infrastructure/persistence/service.repository';
import { Service } from './domain/service';
import { FilesService } from '../files/files.service';
import { StatusEnum } from '../statuses/statuses.enum';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ServicesService {
  constructor(
    private readonly servicesRepository: ServiceRepository,
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  async create(createProfileDto: CreateServiceDto, user: JwtPayloadType): Promise<Service> {
    console.log(" I did survice until here", createProfileDto)
    const clonedPayload = {
      ...createProfileDto
    };

    

    const userObject = await this.usersService.findById(user.id);

    if (!userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }

    console.log("location code", clonedPayload)

    return this.servicesRepository.create({
      ...clonedPayload,
      status:{
        id: StatusEnum.active
      },
      user: userObject
    });
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterServiceDto | null;
    sortOptions?: SortServiceDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<Service[]> {
    return this.servicesRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: Service['id']): Promise<NullableType<Service>> {
    return this.servicesRepository.findById(id);
  }

  async update(
    id: Service['id'],
    payload: DeepPartial<Service>,
    user: JwtPayloadType,
  ): Promise<Service | null> {
    const clonedPayload = { ...payload };

    if (clonedPayload.status?.id) {
      const statusObject = Object.values(StatusEnum)
        .map(String)
        .includes(String(clonedPayload.status.id));
      if (!statusObject) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            status: 'statusNotExists',
          },
        });
      }
    }

    const userObject = await this.usersService.findById(user.id);

    if (!userObject) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'userNotFound',
        },
      });
    }//

    const updatePayload: Partial<Pick<Service, 'title' | 'image' | 'description' | 'price' | 'user' | 'status'>> = {
      title: clonedPayload.title,
      image: clonedPayload.image,
      description: clonedPayload.description,
      price: clonedPayload.price,
      user: userObject,
    };

    return this.servicesRepository.update(id, updatePayload);
  }

  async remove(id: Service['id']): Promise<void> {
    await this.servicesRepository.remove(id);
  }
}
