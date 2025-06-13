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
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { GoogleMeetService } from './google-meet.service';
import { CreateGoogleMeetDto } from './dto/create-google-meet.dto';
import { UpdateGoogleMeetDto } from './dto/update-google-meet.dto';
import { QueryGoogleMeetDto } from './dto/query-google-meet.dto';
import { GoogleMeet } from './domain/google-meet';
import { NullableType } from '../utils/types/nullable.type';
import { AuthUser } from '../utils/decorators/auth-user.decorator';
import { JwtPayloadType } from '../auth/strategies/types/jwt-payload.type';

@ApiTags('Google Meet')
@Controller({
  path: 'google-meet',
  version: '1',
})
export class GoogleMeetController {
  constructor(private readonly googleMeetService: GoogleMeetService) {}

  @ApiOperation({ summary: 'Create a new Google Meet session' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Successfully created Google Meet session',
    type: GoogleMeet,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'))
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(
    @Body() createGoogleMeetDto: CreateGoogleMeetDto,
    @AuthUser() user: JwtPayloadType,
  ): Promise<GoogleMeet> {
    return this.googleMeetService.create(createGoogleMeetDto, user);
  }

  @ApiOperation({ summary: 'Get all Google Meet sessions with pagination' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved Google Meet sessions',
    type: [GoogleMeet],
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(@Query() query: QueryGoogleMeetDto): Promise<GoogleMeet[]> {
    return this.googleMeetService.findManyWithPagination({
      filterOptions: query.filters,
      sortOptions: query.sort,
      paginationOptions: {
        page: query.page || 1,
        limit: query.limit || 10,
      },
    });
  }

  @ApiOperation({ summary: 'Get a Google Meet session by ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved Google Meet session',
    type: GoogleMeet,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string): Promise<NullableType<GoogleMeet>> {
    return this.googleMeetService.findById(Number(id));
  }

  @ApiOperation({ summary: 'Get a Google Meet session by booking ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully retrieved Google Meet session',
    type: GoogleMeet,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'))
  @Get('booking/:bookingId')
  @HttpCode(HttpStatus.OK)
  findByBookingId(@Param('bookingId') bookingId: string): Promise<NullableType<GoogleMeet>> {
    return this.googleMeetService.findByBookingId(Number(bookingId));
  }

  @ApiOperation({ summary: 'Update a Google Meet session' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Successfully updated Google Meet session',
    type: GoogleMeet,
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(
    @Param('id') id: string,
    @Body() updateGoogleMeetDto: UpdateGoogleMeetDto,
    @AuthUser() user: JwtPayloadType,
  ): Promise<GoogleMeet> {
    return this.googleMeetService.update(Number(id), updateGoogleMeetDto, user);
  }

  @ApiOperation({ summary: 'Delete a Google Meet session' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Successfully deleted Google Meet session',
  })
  @ApiBearerAuth()
  @SerializeOptions({
    groups: ['admin'],
  })
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id') id: string,
    @AuthUser() user: JwtPayloadType,
  ): Promise<void> {
    return this.googleMeetService.remove(Number(id), user);
  }
} 