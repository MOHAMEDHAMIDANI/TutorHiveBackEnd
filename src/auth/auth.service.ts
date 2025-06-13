import {
    HttpStatus,
    Injectable,
    NotFoundException,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
import ms from 'ms';
import axios from 'axios';
import crypto from 'crypto';
import { randomStringGenerator } from '@nestjs/common/utils/random-string-generator.util';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthProvidersEnum } from './auth-providers.enum';
import { SocialInterface } from '../social/interfaces/social.interface';
import { ApplyForTutorDTO, AuthRegisterLoginDto, AuthSocialConnectInput, ResendConfirmationDTO } from './dto/auth-register-login.dto';
import { NullableType } from '../utils/types/nullable.type';
import { LoginResponseDto } from './dto/login-response.dto';
import { ConfigService } from '@nestjs/config';
import { JwtRefreshPayloadType } from './strategies/types/jwt-refresh-payload.type';
import { JwtPayloadType } from './strategies/types/jwt-payload.type';
import { UsersService } from '../users/users.service';
import { AllConfigType } from '../config/config.type';
import { MailService } from '../mail/mail.service';
import { RoleEnum } from '../roles/roles.enum';
import { Session } from '../session/domain/session';
import { SessionService } from '../session/session.service';
import { StatusEnum } from '../statuses/statuses.enum';
import { User } from '../users/domain/user';
import { AuthConfirmEmailDto, AuthConfirmNewEmailDto } from './dto/auth-confirm-email.dto';
import { AuthForgotPasswordDto } from './dto/auth-forgot-password.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthConfirmPaymentDto } from './dto/auth-confirm-payment.dto';
// import { InjectStripeClient, StripeWebhookHandler } from '@golevelup/nestjs-stripe';
// import Stripe from 'stripe';

interface ChatUserResponse {
    user: {
        id: string;
        email: string;
        username: string;
        bio?: string;
    };
    avatarUrl?: string;
    online?: boolean;
}

interface SessionWithHash extends Omit<Session, "id" | "createdAt" | "updatedAt" | "deletedAt"> {
    hash: string;
    user: User;
}

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private usersService: UsersService,
        private sessionService: SessionService,
        private mailService: MailService,
        private configService: ConfigService<AllConfigType>,
         // injects the instantiated Stripe client which can be used to make API calls
        // @InjectStripeClient() private readonly stripeClient: Stripe,
    ) { }

    async validateLogin(loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
        const user = await this.usersService.findByEmail(loginDto.email);
        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    email: 'notFound',
                },
            });
        }

        let chatUser: ChatUserResponse | null = null;
        try {
            console.log("Attempting to login chat user with:", {
                url: `${process.env.CHAT_API_URL}/auth/login`,
                email: loginDto.email
            });

            const chatUserResponse = await axios.post<ChatUserResponse>(`${process.env.CHAT_API_URL}/auth/login`, {
                email: loginDto.email,
                password: loginDto.password,
            });

            chatUser = chatUserResponse.data;
            console.log("Chat login successful. Response:", chatUser);
        } catch (error) {
            console.error('Failed to login chat user. Details:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data
            });
        }

        if (user.provider !== AuthProvidersEnum.email) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    email: `needLoginViaProvider:${user.provider}`,
                },
            });
        }

        if (!user.password) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    password: 'incorrectPassword',
                },
            });
        }

        const isValidPassword = await bcrypt.compare(
            loginDto.password,
            user.password,
        );

        if (!isValidPassword) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    password: 'incorrectPassword',
                },
            });
        }

        const hash = crypto
            .createHash('sha256')
            .update(randomStringGenerator())
            .digest('hex');

        const session = await this.sessionService.create({
            user,
            hash,
        });

        const { token, refreshToken, tokenExpires } = await this.getTokensData({
            id: user.id,
            role: user.role,
            sessionId: session.id,
            hash,
        });

        return {
            refreshToken,
            token,
            tokenExpires,
            user,
            chatUser: chatUser ? {
                id: parseInt(chatUser.user.id),
                username: chatUser.user.username || "",
                email: chatUser.user.email || "",
                bio: chatUser.user.bio || "",
                avatarUrl: chatUser.avatarUrl || "",
                online: chatUser.online || false
            } : null
        };
    }

    async validateSocialLogin(
        authProvider: string,
        socialData: SocialInterface,
    ): Promise<LoginResponseDto> {
        let user: NullableType<User> = null;
        const socialEmail = socialData.email?.toLowerCase();
        let userByEmail: NullableType<User> = null;

        if (socialEmail) {
            userByEmail = await this.usersService.findByEmail(socialEmail);
        }
        // stripeClient.

        if (socialData.id) {
            user = await this.usersService.findBySocialIdAndProvider({
                socialId: socialData.id,
                provider: authProvider,
            });
        }

        if (user) {
            if (socialEmail && !userByEmail) {
                user.email = socialEmail;
            }
            await this.usersService.update(user.id, user);
        } else if (userByEmail) {
            user = userByEmail;
        } else if (socialData.id) {
            const role = {
                id: RoleEnum.user,
            };
            const status = {
                id: StatusEnum.active,
            };

            user = await this.usersService.create({
                email: socialEmail ?? null,
                phone: "",
                firstName: socialData.firstName ?? null,
                lastName: socialData.lastName ?? null,
                socialId: socialData.id,
                provider: authProvider,
                role,
                status,
                stepCode:101
            });

            user = await this.usersService.findById(user.id);
        }

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        const hash = crypto
            .createHash('sha256')
            .update(randomStringGenerator())
            .digest('hex');

        const session = await this.sessionService.create({
            user,
            hash,
        });

        const {
            token: jwtToken,
            refreshToken,
            tokenExpires,
        } = await this.getTokensData({
            id: user.id,
            role: user.role,
            sessionId: session.id,
            hash,
        });

        return {
            refreshToken,
            token: jwtToken,
            tokenExpires,
            user,
            chatUser: null // Initialize with null - will be populated by auth controller
        };
    }

    async register(dto: AuthRegisterLoginDto): Promise<LoginResponseDto> {
        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    email: 'emailExists',
                },
            });
        }

        let chatUserResponse: ChatUserResponse | null = null;
        
        try {
            // Directly register the user on the chat server
            console.log("Creating new chat user:", dto.email);
            const registerResponse = await axios.post<ChatUserResponse>(`${process.env.CHAT_API_URL}/auth/register`, {
                email: dto.email,
                username: dto.firstName + " " + dto.lastName,
                password: dto.password,
            });
            chatUserResponse = registerResponse.data;
            console.log("Chat user creation successful. Response:", chatUserResponse);
        } catch (error) {
            console.error('Failed to create chat user:', error.message);
        }

        const user = await this.usersService.create({
            ...dto,
            email: dto.email,
            phone: dto.phone,
            university: dto.university ?? null,
            interests: dto.interests ?? null,
            goals: dto.goals ?? null,
            role: {
                id: RoleEnum.student,
            },
            status: {
                id: StatusEnum.not_verified,
            },
            stepCode: 1
        });

        const hash = await this.jwtService.signAsync(
            {
                confirmEmailUserId: user.id,
            },
            {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true,
                }),
                expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
                    infer: true,
                }),
            },
        );

        await this.mailService.userSignUp({
            to: dto.email,
            data: {
                hash,
            },
            userId: Number(user.id),
            sendVerification: dto.sendVerification || false,
            verificationType: dto.verificationType || "link"
        });
        
        const result = await this.SendSignedUser(Number(user.id));
        
        // Add chat user to the response if available
        if (chatUserResponse) {
            result.chatUser = {
                id: parseInt(chatUserResponse.user.id),
                username: chatUserResponse.user.username || "",
                email: chatUserResponse.user.email || "",
                bio: chatUserResponse.user.bio || "",
                avatarUrl: chatUserResponse.avatarUrl || "",
                online: chatUserResponse.online || false
            };
        }
        
        return result;
    }
    async registerAdmin(dto: AuthRegisterLoginDto): Promise<LoginResponseDto> {

        const existingUser = await this.usersService.findByEmail(dto.email);

        if (existingUser) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    email: 'emailExists',
                },
            });
        }

        // Create chat user for admin
        let chatUserResponse: ChatUserResponse | null = null;
        
        try {
            // First try to login to the chat server
            try {
                console.log("Attempting to login admin to chat server first:", dto.email);
                const loginResponse = await axios.post<ChatUserResponse>(`${process.env.CHAT_API_URL}/auth/login`, {
                    email: dto.email,
                    password: dto.password,
                });
                chatUserResponse = loginResponse.data;
                console.log("Chat login successful. Admin already exists. Response:", chatUserResponse);
            } catch (loginError) {
                // If login fails, create a new chat user
                console.log("Chat login failed, creating new admin chat user:", dto.email);
                const registerResponse = await axios.post<ChatUserResponse>(`${process.env.CHAT_API_URL}/auth/register`, {
                    email: dto.email,
                    username: dto.firstName + " " + dto.lastName,
                    password: dto.password,
                });
                chatUserResponse = registerResponse.data;
                console.log("Chat user creation successful for admin. Response:", chatUserResponse);
            }
        } catch (error) {
            console.error('Failed to handle chat user for admin:', error.message);
        }

        const user = await this.usersService.create({
            ...dto,
            email: dto.email,
            phone: dto.phone,
            university: dto.university ?? null,
            interests: dto.interests ?? null,
            goals: dto.goals ?? null,
            role: {
                id: RoleEnum.admin,
            },
            status: {
                id: StatusEnum.not_verified,
            },
            stepCode:1
        });

        const hash = await this.jwtService.signAsync(
            {
                confirmEmailUserId: user.id,
            },
            {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true,
                }),
                expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
                    infer: true,
                }),
            },
        );

        await this.mailService.userSignUp({
            to: dto.email,
            data: {
                hash,
            },
            userId:user.id,
            sendVerification:dto.sendVerification || false,
            verificationType:dto.verificationType || "link"
        });
        
        const result = await this.SendSignedUser(user.id);
        
        // Add chat user to the response if available
        if (chatUserResponse) {
            result.chatUser = {
                id: parseInt(chatUserResponse.user.id),
                username: chatUserResponse.user.username || "",
                email: chatUserResponse.user.email || "",
                bio: chatUserResponse.user.bio || "",
                avatarUrl: chatUserResponse.avatarUrl || "",
                online: chatUserResponse.online || false
            };
        }
        
        return result;
    }

    async social_connect(dto: AuthSocialConnectInput): Promise<LoginResponseDto> {

        const seeIfExists = await this.usersService.findBySocialIdAndProvider({
            socialId: dto.socialId,
            provider: dto.provider,
        })

        if(seeIfExists){
            const x = await  this.SendSignedUser(seeIfExists.id);

            console.log("this is social connect repons 2", x)

            return x
        }

        const user = await this.usersService.create({
            ...dto,
            phone: "",
            role: {
                id: RoleEnum.user,
            },
            status: {
                id: StatusEnum.active,
            },
            stepCode:101
        });

        const x = await  this.SendSignedUser(Number(user.id));

        console.log("this is social connect repons", x)

        return x
    }

    async applyForTutor(userJwtPayload: JwtPayloadType, dto:ApplyForTutorDTO): Promise<LoginResponseDto> {

        // update user with tutor status and other details
        const user = await this.usersService.findById(userJwtPayload.id);

        if(!user){
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        // if(user.role?.id !== RoleEnum.student){
        //     throw new UnprocessableEntityException({
        //         status: HttpStatus.UNPROCESSABLE_ENTITY,
        //         errors: {
        //             user: 'userIsNotAStudent',
        //         },
        //     });
        // }
        console.log("saving days", dto.availableDays[0].timeSlots[0])

        // update user with tutor application details
        await this.usersService.update(user.id, {
            qualification: dto.qualification,
            experience: dto.experience,
            hourlyRate: dto.hourlyRate,
            availableDays: dto.availableDays,
            unavailableDates: dto.unavailableDates,
            subjects: dto.subjects,
            gradeLevels: dto.gradeLevels,
            description: dto.description,
            tags: dto.tags,
            services: dto.services.map((service) => {
                return {
                    id: Number(service),
                };
            }),
            // Don't change the role yet - only after admin approval
            status: {
                id: StatusEnum.pending_tutor_application,
            },
        });

        // notify admin
        // await this.mailService.applyForTutor({
        //     to: this.configService.getOrThrow('mail.adminEmail', {
        //         infer: true,
        //     }),
        //     data: {
        //         user,
        //         dto,
        //     },
        // });

        await this.mailService.applyForTutor({
            to: user.email || "",
            userId: user.id,
            data: {
                user,
                dto,
                userId: Number(user.id),
            },
            sendVerification:false,
            verificationType:"link"
        });

        return this.SendSignedUser(user.id);
    }
    


    async resendConfirmationOTP(userJwtPayload: JwtPayloadType, dto:ResendConfirmationDTO): Promise<void> {


        let user: User|null;
        user = await this.usersService.findById(userJwtPayload.id);

        if(!user){
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }
        

        const hash = await this.jwtService.signAsync(
            {
                confirmEmailUserId: user.id,
            },
            {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true,
                }),
                expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
                    infer: true,
                }),
            },
        );
        await this.mailService.userSignUp({
            to: user.email || "",
            data: {
                hash,
            },
            userId:user.id,
            sendVerification:dto.sendVerification || false,
            verificationType:dto.verificationType || "link"
        });
    }

    // @StripeWebhookHandler('payment_intent.succeeded')
    // async authVerifyPayment(evt: Stripe.PaymentIntentSucceededEvent){

    //     console.log("yo!!!, payment got in")
    //     console.log(evt)
        
    // }

   

    async confirmPayment(userJwtPayload: JwtPayloadType, dto:AuthConfirmPaymentDto): Promise<void> {
        let user: User|null;
        user = await this.usersService.findById(userJwtPayload.id);

        if(!user){
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }
        

        const hash = await this.jwtService.signAsync(
            {
                confirmEmailUserId: user.id,
            },
            {
                secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                    infer: true,
                }),
                expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
                    infer: true,
                }),
            },
        );
        // await this.mailService.userSignUp({
        //     to: user.email || "",
        //     data: {
        //         hash,
        //     },
        //     userId:user.id,
        //     sendVerification:dto.sendVerification || false,
        //     verificationType:dto.verificationType || "link"
        // });
    }

    async confirmEmail(body: AuthConfirmEmailDto): Promise<LoginResponseDto> {
        let userId: User['id'];

        try {
            userId = parseInt(body.userId.toString());
        } catch {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    hash: `invalidHash`,
                },
            });
        }

        const user = await this.usersService.findById(userId);

        if (
            !user ||
            user?.status?.id?.toString() !== StatusEnum.not_verified.toString()
        ) {
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                error: `notFound`,
            });
        }

        console.log("api code: ", body.verificationCode4);
        console.log("db code: ", user.verificationCode4);

        if (
            !user ||
            ((user?.verificationCode4 != body.verificationCode4 || 
                (user?.verificationCode4 === parseInt(process.env.TEST_OTP || "1234") && process.env.ALLOW_TEST_OTP))
                && user?.verificationCode4 !== null
            )
        ) {
            throw new NotFoundException({
                status: HttpStatus.BAD_REQUEST,
                error: `Invalid verification code`,
            });
        }

        user.status = {
            id: StatusEnum.active,
        };
        user.verificationCode4 = null;
        user.stepCode = 2; // towards the questions step

        await this.usersService.update(user.id, user);


        return this.SendSignedUser(user.id);
    }

    async SendSignedUser(userId: string | number): Promise<LoginResponseDto> {
        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        const sessionHash = crypto.randomBytes(32).toString('hex');
        
        const session = await this.sessionService.create({
            user,
            hash: sessionHash
        });

        const { token, refreshToken, tokenExpires } = await this.getTokensData({
            id: user.id,
            role: user.role,
            sessionId: session.id,
            hash: sessionHash
        });

        return {
            refreshToken,
            token,
            tokenExpires,
            user
        };
    }

    async sendMe(userJwtPayload: JwtPayloadType): Promise<LoginResponseDto> {
        return this.SendSignedUser(userJwtPayload.id);
    }

    async confirmNewEmail(body: AuthConfirmNewEmailDto): Promise<void> {
        let userId: User['id'];
        let newEmail: User['email'];

        try {


            userId = parseInt(body.userId.toString());
            newEmail = body.email;
        } catch {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    hash: `invalidHash`,
                },
            });
        }

        const user = await this.usersService.findById(userId);

        if (!user) {
            throw new NotFoundException({
                status: HttpStatus.NOT_FOUND,
                error: `notFound`,
            });
        }

        user.email = newEmail;
        user.status = {
            id: StatusEnum.active,
        };

        await this.usersService.update(user.id, user);
    }

    async forgotPassword(dto: AuthForgotPasswordDto): Promise<void> {
        const user = await this.usersService.findByEmail(dto.email);

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    email: 'emailNotExists',
                },
            });
        }

        const tokenExpiresIn = this.configService.getOrThrow('auth.forgotExpires', {
            infer: true,
        });

        const tokenExpires = Date.now() + ms(tokenExpiresIn);

        const hash = await this.jwtService.signAsync(
            {
                forgotUserId: user.id,
            },
            {
                secret: this.configService.getOrThrow('auth.forgotSecret', {
                    infer: true,
                }),
                expiresIn: tokenExpiresIn,
            },
        );

        await this.mailService.forgotPassword({
            to: user.email || "",
            data: {
                hash,
                tokenExpires,
            },
            userId:user.id,
            sendVerification:dto.sendVerification || false,
            verificationType:dto.verificationType || "link"
        });
    }

    async resetPassword(dto:AuthResetPasswordDto): Promise<void> {
        let userId: User['id'];
        // let userEmail: User['email']
        let user:User|null;

        if(dto.verificationType=="link")
        {

            try {
                const jwtData = await this.jwtService.verifyAsync<{
                    forgotUserId: User['id'];
                }>(dto.hash, {
                    secret: this.configService.getOrThrow('auth.forgotSecret', {
                        infer: true,
                    }),
                });

                userId = jwtData.forgotUserId;
            } catch {
                throw new UnprocessableEntityException({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        hash: `invalidHash`,
                    },
                });
            }

            user = await this.usersService.findById(userId);

        }else{
            user = await this.usersService.findByEmail(dto.email);

            // userId = dto.userId;
        }


        if(dto.verificationType=="otp"){
            if (
                !user ||
                ((user?.verificationCode4 != dto.verificationCode4 || 
                    (user?.verificationCode4 === parseInt(process.env.TEST_OTP || "1234") && process.env.ALLOW_TEST_OTP))
                    && user?.verificationCode4 !== null
                )
            ) {
                throw new NotFoundException({
                    status: HttpStatus.BAD_REQUEST,
                    error: `Invalid verification code`,
                });
            }
        }

        if (!user) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    hash: `notFound`,
                },
            });
        }

        user.password = dto.password;

        await this.sessionService.deleteByUserId({
            userId: user.id,
        });

        await this.usersService.update(user.id, user);
    }

    async me(userJwtPayload: JwtPayloadType): Promise<NullableType<User>> {
        return this.usersService.findById(userJwtPayload.id);
    }

    async update(
        userJwtPayload: JwtPayloadType,
        userDto: AuthUpdateDto,
    ): Promise<NullableType<User>> {
        const currentUser = await this.usersService.findById(userJwtPayload.id);

        if (!currentUser) {
            throw new UnprocessableEntityException({
                status: HttpStatus.UNPROCESSABLE_ENTITY,
                errors: {
                    user: 'userNotFound',
                },
            });
        }

        if (userDto.password) {
            if (!userDto.oldPassword) {
                throw new UnprocessableEntityException({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        oldPassword: 'missingOldPassword',
                    },
                });
            }

            if (!currentUser.password) {
                throw new UnprocessableEntityException({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        oldPassword: 'incorrectOldPassword',
                    },
                });
            }

            const isValidOldPassword = await bcrypt.compare(
                userDto.oldPassword,
                currentUser.password,
            );

            if (!isValidOldPassword) {
                throw new UnprocessableEntityException({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        oldPassword: 'incorrectOldPassword',
                    },
                });
            } else {
                await this.sessionService.deleteByUserIdWithExclude({
                    userId: currentUser.id,
                    excludeSessionId: userJwtPayload.sessionId,
                });
            }
        }

        if (userDto.email && userDto.email !== currentUser.email) {
            const userByEmail = await this.usersService.findByEmail(userDto.email);

            if (userByEmail && userByEmail.id !== currentUser.id) {
                throw new UnprocessableEntityException({
                    status: HttpStatus.UNPROCESSABLE_ENTITY,
                    errors: {
                        email: 'emailExists',
                    },
                });
            }

            const hash = await this.jwtService.signAsync(
                {
                    confirmEmailUserId: currentUser.id,
                    newEmail: userDto.email,
                },
                {
                    secret: this.configService.getOrThrow('auth.confirmEmailSecret', {
                        infer: true,
                    }),
                    expiresIn: this.configService.getOrThrow('auth.confirmEmailExpires', {
                        infer: true,
                    }),
                },
            );

            await this.mailService.confirmNewEmail({
                to: userDto.email,
                data: {
                    hash,
                },
                userId: currentUser.id,
                sendVerification: userDto.sendVerification || false,
                verificationType: userDto.verificationType || "link"
            });
        }

        delete userDto.email;
        delete userDto.oldPassword;

        console.log("about to update ther user with", userDto);

        await this.usersService.update(userJwtPayload.id, userDto);
        await this.usersService.update(userJwtPayload.id, {stepCode: 2});

        return this.usersService.findById(userJwtPayload.id);
    }

    async refreshToken(
        data: Pick<JwtRefreshPayloadType, 'sessionId' | 'hash'>,
    ): Promise<Omit<LoginResponseDto, 'user'>> {
        const session = await this.sessionService.findById(data.sessionId);

        if (!session) {
            throw new UnauthorizedException();
        }

        if (session.hash !== data.hash) {
            throw new UnauthorizedException();
        }

        const hash = crypto
            .createHash('sha256')
            .update(randomStringGenerator())
            .digest('hex');

        const user = await this.usersService.findById(session.user.id);

        if (!user?.role) {
            throw new UnauthorizedException();
        }

        await this.sessionService.update(session.id, {
            hash,
        });

        const { token, refreshToken, tokenExpires } = await this.getTokensData({
            id: session.user.id,
            role: {
                id: user.role.id,
            },
            sessionId: session.id,
            hash,
        });

        return {
            token,
            refreshToken,
            tokenExpires,
        };
    }

    async softDelete(user: User): Promise<void> {
        await this.usersService.remove(user.id);
    }

    async logout(data: Pick<JwtRefreshPayloadType, 'sessionId'>) {
        return this.sessionService.deleteById(data.sessionId);
    }

    async resetUserPassword(user: User, dto: AuthResetPasswordDto): Promise<void> {
        await this.usersService.update(user.id, { password: dto.password });
    }

    private async getTokensData(data: {
        id: User['id'];
        role: User['role'];
        sessionId: Session['id'];
        hash: Session['hash'];
    }) {
        const tokenExpiresIn = this.configService.getOrThrow('auth.expires', {
            infer: true,
        });

        const tokenExpires = Date.now() + ms(tokenExpiresIn);

        const [token, refreshToken] = await Promise.all([
            await this.jwtService.signAsync(
                {
                    id: data.id,
                    role: data.role,
                    sessionId: data.sessionId,
                },
                {
                    secret: this.configService.getOrThrow('auth.secret', { infer: true }),
                    expiresIn: tokenExpiresIn,
                },
            ),
            await this.jwtService.signAsync(
                {
                    sessionId: data.sessionId,
                    hash: data.hash,
                },
                {
                    secret: this.configService.getOrThrow('auth.refreshSecret', {
                        infer: true,
                    }),
                    expiresIn: this.configService.getOrThrow('auth.refreshExpires', {
                        infer: true,
                    }),
                },
            ),
        ]);

        return {
            token,
            refreshToken,
            tokenExpires,
        };
    }
}