import { HttpStatus, Injectable, UnprocessableEntityException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { RoleEnum } from 'src/roles/roles.enum';
import { StatusEnum } from 'src/statuses/statuses.enum';
import { MailService } from 'src/mail/mail.service';
import { User } from 'src/users/domain/user';
import { NullableType } from 'src/utils/types/nullable.type';

@Injectable()
export class AdminService {
    constructor(
        private readonly usersService: UsersService,
        private readonly mailService: MailService
    ) {}

    async approveTutorApplication(userId: number): Promise<NullableType<User>> {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        // Check if the user has a pending tutor application
        if (user.status?.id !== StatusEnum.pending_tutor_application) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'noPendingTutorApplication',
                },
            });
        }

        // Update user status to active and role to tutor
        await this.usersService.update(user.id, {
            role: {
                id: RoleEnum.tutor,
            },
            status: {
                id: StatusEnum.active,
            }
        });

        // Send confirmation email to user
        await this.mailService.tutorApplicationUpdate({
            to: user.email || "",
            data: {
                user,
                approved: true,
                message: 'Your application to become a tutor has been approved.'
            },
            userId: user.id,
            sendVerification: false,
            verificationType: "link"
        });

        // Return the updated user
        return this.usersService.findById(user.id);
    }

    async rejectTutorApplication(userId: number, reason: string): Promise<NullableType<User>> {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        // Check if the user has a pending tutor application
        if (user.status?.id !== StatusEnum.pending_tutor_application) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'noPendingTutorApplication',
                },
            });
        }

        // Update user status to active and keep their original role
        await this.usersService.update(user.id, {
            role: {
                id: RoleEnum.student, // Revert to student role if rejected
            },
            status: {
                id: StatusEnum.active,
            }
        });

        // Send rejection email to user
        await this.mailService.tutorApplicationUpdate({
            to: user.email || "",
            data: {
                user,
                approved: false,
                reason: reason,
                message: 'Your application to become a tutor has been rejected.'
            },
            userId: user.id,
            sendVerification: false,
            verificationType: "link"
        });

        // Return the updated user
        return this.usersService.findById(user.id);
    }

    async getPendingTutorApplications(): Promise<User[]> {
        return this.usersService.findPendingTutorApplications();
    }
}
