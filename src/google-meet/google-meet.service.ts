import {
  HttpStatus,
  Injectable,
  UnprocessableEntityException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { CreateGoogleMeetDto } from './dto/create-google-meet.dto';
import { UpdateGoogleMeetDto } from './dto/update-google-meet.dto';
import { NullableType } from '../utils/types/nullable.type';
import { FilterGoogleMeetDto, SortGoogleMeetDto } from './dto/query-google-meet.dto';
import { GoogleMeet } from './domain/google-meet';
import { IPaginationOptions } from '../utils/types/pagination-options';
import { DeepPartial } from '../utils/types/deep-partial.type';
import { JwtPayloadType } from 'src/auth/strategies/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';
import { UserEntity } from 'src/users/infrastructure/persistence/relational/entities/user.entity';
import { GoogleMeetEntity } from './infrastructure/persistence/relational/entities/google-meet.entity';
import { GoogleMeetRepository } from './infrastructure/persistence/relational/repositories/google-meet.repository';
import { BookingsService } from 'src/bookings/bookings.service';
import { BookingEntity } from 'src/bookings/infrastructure/persistence/relational/entities/booking.entity';

@Injectable()
export class GoogleMeetService {
  constructor(
    private readonly googleMeetRepository: GoogleMeetRepository,
    private readonly usersService: UsersService,
    private readonly bookingsService: BookingsService,
    private readonly configService: ConfigService,
  ) {}

  async create(createGoogleMeetDto: CreateGoogleMeetDto, user: JwtPayloadType): Promise<GoogleMeet> {
    // Verify that the organizer exists
    const organizer = await this.usersService.findById(createGoogleMeetDto.organizerId);
    if (!organizer) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          organizer: 'organizerNotFound',
        },
      });
    }

    // Verify that the attendee exists
    const attendee = await this.usersService.findById(createGoogleMeetDto.attendeeId);
    if (!attendee) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          attendee: 'attendeeNotFound',
        },
      });
    }

    // If bookingId is provided, verify that the booking exists
    let booking: any = null;
    if (createGoogleMeetDto.bookingId) {
      booking = await this.bookingsService.findById(createGoogleMeetDto.bookingId);
      if (!booking) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            booking: 'bookingNotFound',
          },
        });
      }
    }

    // Create Google Meet link and Calendar event
    const { meetUrl, calendarEventId } = await this.createGoogleMeetAndCalendarEvent(
      createGoogleMeetDto.title,
      createGoogleMeetDto.description,
      createGoogleMeetDto.startTime,
      createGoogleMeetDto.endTime,
      organizer.email || '',
      attendee.email || '',
    );

    // Create the Google Meet entity
    const googleMeetEntity = new GoogleMeetEntity();
    googleMeetEntity.title = createGoogleMeetDto.title;
    googleMeetEntity.description = createGoogleMeetDto.description;
    googleMeetEntity.startTime = createGoogleMeetDto.startTime;
    googleMeetEntity.endTime = createGoogleMeetDto.endTime;
    googleMeetEntity.meetUrl = meetUrl;
    googleMeetEntity.calendarEventId = calendarEventId;

    // Set the organizer
    const organizerEntity = new UserEntity();
    organizerEntity.id = Number(createGoogleMeetDto.organizerId);
    googleMeetEntity.organizer = organizerEntity;

    // Set the attendee
    const attendeeEntity = new UserEntity();
    attendeeEntity.id = Number(createGoogleMeetDto.attendeeId);
    googleMeetEntity.attendee = attendeeEntity;

    // Set the booking if provided
    if (booking) {
      const bookingEntity = new BookingEntity();
      bookingEntity.id = Number(createGoogleMeetDto.bookingId);
      googleMeetEntity.booking = bookingEntity;
    }

    // Save the Google Meet entity
    const googleMeet = new GoogleMeet();
    googleMeet.title = googleMeetEntity.title;
    googleMeet.description = googleMeetEntity.description;
    googleMeet.startTime = googleMeetEntity.startTime;
    googleMeet.endTime = googleMeetEntity.endTime;
    googleMeet.meetUrl = googleMeetEntity.meetUrl;
    googleMeet.calendarEventId = googleMeetEntity.calendarEventId;
    googleMeet.organizer = googleMeetEntity.organizer;
    googleMeet.attendee = googleMeetEntity.attendee;
    googleMeet.booking = googleMeetEntity.booking;

    return this.googleMeetRepository.create(googleMeet);
  }

  async createGoogleMeetAndCalendarEvent(
    title: string,
    description: string,
    startTime: Date,
    endTime: Date,
    organizerEmail: string,
    attendeeEmail: string,
  ): Promise<{ meetUrl: string; calendarEventId: string }> {
    // In a real implementation, you would use the Google Calendar API to create an event
    // For this example, we'll simulate the creation of a Google Meet link and Calendar event
    
    // Generate a random Google Meet URL
    const meetCode = Math.random().toString(36).substring(2, 10);
    const meetUrl = `https://meet.google.com/${meetCode}`;
    
    // Generate a random Calendar Event ID
    const calendarEventId = `${Math.random().toString(36).substring(2, 10)}_${Math.floor(Date.now() / 1000)}`;
    
    // In a real implementation, you would use the Google Calendar API like this:
    /*
    const calendar = google.calendar({
      version: 'v3',
      auth: new google.auth.JWT(
        this.configService.get('GOOGLE_CLIENT_EMAIL'),
        null,
        this.configService.get('GOOGLE_PRIVATE_KEY').replace(/\\n/g, '\n'),
        ['https://www.googleapis.com/auth/calendar']
      ),
    });

    const event = {
      summary: title,
      description: description,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: 'UTC',
      },
      attendees: [
        { email: organizerEmail },
        { email: attendeeEmail },
      ],
      conferenceData: {
        createRequest: {
          requestId: Math.random().toString(36).substring(2, 10),
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const calendarEventId = response.data.id;
    const meetUrl = response.data.conferenceData.entryPoints.find(
      (entryPoint) => entryPoint.entryPointType === 'video'
    ).uri;
    */

    return { meetUrl, calendarEventId };
  }

  findManyWithPagination({
    filterOptions,
    sortOptions,
    paginationOptions,
  }: {
    filterOptions?: FilterGoogleMeetDto | null;
    sortOptions?: SortGoogleMeetDto[] | null;
    paginationOptions: IPaginationOptions;
  }): Promise<GoogleMeet[]> {
    return this.googleMeetRepository.findManyWithPagination({
      filterOptions,
      sortOptions,
      paginationOptions,
    });
  }

  findById(id: GoogleMeet['id']): Promise<NullableType<GoogleMeet>> {
    return this.googleMeetRepository.findById(id);
  }

  findByBookingId(bookingId: number): Promise<NullableType<GoogleMeet>> {
    return this.googleMeetRepository.findByBookingId(bookingId);
  }

  async update(
    id: GoogleMeet['id'],
    updateGoogleMeetDto: UpdateGoogleMeetDto,
    user: JwtPayloadType,
  ): Promise<GoogleMeet> {
    const googleMeet = await this.googleMeetRepository.findById(id);
    
    if (!googleMeet) {
      throw new NotFoundException('Google Meet session not found');
    }

    // Check if the user is the organizer or attendee
    if (googleMeet.organizer.id !== user.id && googleMeet.attendee.id !== user.id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'notAuthorized',
        },
      });
    }

    // Update the Google Meet entity
    const updatePayload: DeepPartial<GoogleMeet> = {};

    if (updateGoogleMeetDto.title) {
      updatePayload.title = updateGoogleMeetDto.title;
    }

    if (updateGoogleMeetDto.description) {
      updatePayload.description = updateGoogleMeetDto.description;
    }

    if (updateGoogleMeetDto.startTime) {
      updatePayload.startTime = updateGoogleMeetDto.startTime;
    }

    if (updateGoogleMeetDto.endTime) {
      updatePayload.endTime = updateGoogleMeetDto.endTime;
    }

    if (updateGoogleMeetDto.meetUrl) {
      updatePayload.meetUrl = updateGoogleMeetDto.meetUrl;
    }

    if (updateGoogleMeetDto.calendarEventId) {
      updatePayload.calendarEventId = updateGoogleMeetDto.calendarEventId;
    }

    if (updateGoogleMeetDto.organizerId) {
      const organizer = await this.usersService.findById(updateGoogleMeetDto.organizerId);
      if (!organizer) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            organizer: 'organizerNotFound',
          },
        });
      }
      updatePayload.organizer = { id: updateGoogleMeetDto.organizerId } as any;
    }

    if (updateGoogleMeetDto.attendeeId) {
      const attendee = await this.usersService.findById(updateGoogleMeetDto.attendeeId);
      if (!attendee) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            attendee: 'attendeeNotFound',
          },
        });
      }
      updatePayload.attendee = { id: updateGoogleMeetDto.attendeeId } as any;
    }

    if (updateGoogleMeetDto.bookingId) {
      const booking = await this.bookingsService.findById(updateGoogleMeetDto.bookingId);
      if (!booking) {
        throw new UnprocessableEntityException({
          status: HttpStatus.UNPROCESSABLE_ENTITY,
          errors: {
            booking: 'bookingNotFound',
          },
        });
      }
      updatePayload.booking = { id: updateGoogleMeetDto.bookingId } as any;
    }

    // In a real implementation, you would update the Google Calendar event
    // For this example, we'll just update the database record

    return this.googleMeetRepository.update(id, updatePayload);
  }

  async remove(id: GoogleMeet['id'], user: JwtPayloadType): Promise<void> {
    const googleMeet = await this.googleMeetRepository.findById(id);
    
    if (!googleMeet) {
      throw new NotFoundException('Google Meet session not found');
    }

    // Check if the user is the organizer or attendee
    if (googleMeet.organizer.id !== user.id && googleMeet.attendee.id !== user.id) {
      throw new UnprocessableEntityException({
        status: HttpStatus.UNPROCESSABLE_ENTITY,
        errors: {
          user: 'notAuthorized',
        },
      });
    }

    // In a real implementation, you would delete the Google Calendar event
    // For this example, we'll just delete the database record

    await this.googleMeetRepository.remove(id);
  }
} 