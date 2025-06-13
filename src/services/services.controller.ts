import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  HttpStatus,
  HttpCode,
  SerializeOptions,
  Request,
} from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';
import { AuthGuard } from '@nestjs/passport';

import {
  InfinityPaginationResponse,
  InfinityPaginationResponseDto,
} from '../utils/dto/infinity-pagination-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { QueryServiceDto } from './dto/query-service.dto';
import { Service } from './domain/service';
import { ServicesService } from './services.service';
import { RolesGuard } from '../roles/roles.guard';
import { infinityPagination } from '../utils/infinity-pagination';

@Controller({
  path: 'services',
  version: '1',
})
@ApiTags('Services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student, RoleEnum.admin)
  @ApiBearerAuth()
  @ApiCreatedResponse({
    type: Service,
  })
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createServiceDto: CreateServiceDto, @Request() request): Promise<Service> {
    console.log("create service controller", createServiceDto)
    return this.servicesService.create(createServiceDto, request.user);
  }

  @ApiOkResponse({
    type: InfinityPaginationResponse(Service),
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() query: QueryServiceDto,
  ): Promise<InfinityPaginationResponseDto<Service>> {
    const page = query?.page ?? 1;
    let limit = query?.limit ?? 10;
    if (limit > 50) {
      limit = 50;
    }

    return infinityPagination(
      await this.servicesService.findManyWithPagination({
        filterOptions: query?.filters,
        sortOptions: query?.sort,
        paginationOptions: {
          page,
          limit,
        },
      }),
      { page, limit },
    );
  }

  @ApiOkResponse({
    type: Service,
  })
  @SerializeOptions({
    groups: ['admin'],
  })
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  findOne(@Param('id') id: Service['id']): Promise<NullableType<Service>> {
    return this.servicesService.findById(id);
  }

  @ApiOkResponse({
    type: Service,
  })
  @Patch(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.student, RoleEnum.admin)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  update(
    @Param('id') id: Service['id'],
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() request,
  ): Promise<Service | null> {
    return this.servicesService.update(id, updateServiceDto, request.user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.tutor, RoleEnum.admin, RoleEnum.student)
  @ApiBearerAuth()
  @ApiParam({
    name: 'id',
    type: String,
    required: true,
  })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: Service['id']): Promise<void> {
    return this.servicesService.remove(id);
  }
}
