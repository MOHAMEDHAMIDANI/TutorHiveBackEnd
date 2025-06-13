import {
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Request,
    Post,
    UseGuards,
    Patch,
    Delete,
    SerializeOptions,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthEmailLoginDto } from './dto/auth-email-login.dto';
import { AuthForgotPasswordDto, SuccessDTO } from './dto/auth-forgot-password.dto';
import { AuthConfirmEmailDto, AuthConfirmNewEmailDto } from './dto/auth-confirm-email.dto';
import { AuthResetPasswordDto } from './dto/auth-reset-password.dto';
import { AuthUpdateDto } from './dto/auth-update.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApplyForTutorDTO, AuthRegisterLoginDto, AuthSocialConnectInput, ResendConfirmationDTO } from './dto/auth-register-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { NullableType } from '../utils/types/nullable.type';
import { User } from '../users/domain/user';
import { RefreshResponseDto } from './dto/refresh-response.dto';
import { AuthConfirmPaymentDto } from './dto/auth-confirm-payment.dto';
import { RolesGuard } from '../roles/roles.guard';
import { Roles } from '../roles/roles.decorator';
import { RoleEnum } from '../roles/roles.enum';

@ApiTags('Auth')
@Controller({
    path: 'auth',
    version: '1',
})
export class AuthController {
    constructor(private readonly service: AuthService) { }

    @SerializeOptions({
        groups: ['me'],
    })
    @Post('email/login')
    @ApiOkResponse({
        type: LoginResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    public login(@Body() loginDto: AuthEmailLoginDto): Promise<LoginResponseDto> {
        return this.service.validateLogin(loginDto);
    }

    @Post('email/register')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginResponseDto,
    })
    async register(@Body() createUserDto: AuthRegisterLoginDto): Promise<LoginResponseDto> {
        return this.service.register(createUserDto);
    }

    @Post('admin/register')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginResponseDto,
    })
    async registerAdmin(@Body() createAdminDto: AuthRegisterLoginDto): Promise<LoginResponseDto> {
        return this.service.registerAdmin(createAdminDto);
    }

    @Post('social/connect')
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: LoginResponseDto,
    })
    async socialConnect(@Body() createUserDto: AuthSocialConnectInput): Promise<LoginResponseDto> {
        console.log("this is what i'm going to send 11")
        const r = await this.service.social_connect(createUserDto);
        const rr =JSON.parse(JSON.stringify(r))
        return rr
    }

    @Post('email/confirm')
    @ApiOkResponse({
        type: LoginResponseDto,
    })
    @HttpCode(HttpStatus.OK)
    async confirmEmail(
        @Body() confirmEmailDto: AuthConfirmEmailDto,
    ): Promise<LoginResponseDto> {
        return this.service.confirmEmail(confirmEmailDto);
    }

    @Post('resend-confirmation-otp')
    @ApiBearerAuth()
    @SerializeOptions({
        groups: ['me'],
    })
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async resendConfirmationOTP(@Request() request, @Body() dto:ResendConfirmationDTO): Promise<void> {
        this.service.resendConfirmationOTP(request.user, dto);
    }

    @Post('apply-for-tutor')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async applyForTutor(@Request() request, @Body() dto:ApplyForTutorDTO): Promise<LoginResponseDto> {
        return this.service.applyForTutor(request.user, dto);
    }

    @Post('confirm-payment')
    @ApiBearerAuth()
    @SerializeOptions({
        groups: ['me'],
    })
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async confirmPayment(@Request() request, @Body() dto:AuthConfirmPaymentDto): Promise<void> {
        this.service.confirmPayment(request.user, dto);
    }

    @Post('email/confirm/new')
    @HttpCode(HttpStatus.NO_CONTENT)
    async confirmNewEmail(
        @Body() confirmEmailDto: AuthConfirmNewEmailDto,
    ): Promise<void> {
        return this.service.confirmNewEmail(confirmEmailDto);
    }

    @Post('forgot/password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(
        @Body() forgotPasswordDto: AuthForgotPasswordDto,
    ): Promise<SuccessDTO> {
        await this.service.forgotPassword(forgotPasswordDto);
        return {done: true};
    }

    @Post('reset/password')
    @HttpCode(HttpStatus.OK)
    async resetPassword(@Body() resetPasswordDto: AuthResetPasswordDto): Promise<SuccessDTO> {
        await this.service.resetPassword(
            resetPasswordDto
        );
        return {done: true};

    }

    @Post('reset-password')
    @ApiBearerAuth()
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    async resetUserPassword(
        @Request() request,
        @Body() resetPasswordDto: AuthResetPasswordDto,
    ): Promise<SuccessDTO> {
        await this.service.resetUserPassword(request.user, resetPasswordDto);
        return { done: true };
    }

    @ApiBearerAuth()
    @SerializeOptions({
        groups: ['me'],
    })
    @Get('me')
    @UseGuards(AuthGuard('jwt'))
    @ApiOkResponse({
        type: User,
    })
    @HttpCode(HttpStatus.OK)
    public me(@Request() request): Promise<LoginResponseDto> {
        return this.service.sendMe(request.user);
    }

    @ApiBearerAuth()
    @ApiOkResponse({
        type: RefreshResponseDto,
    })
    @SerializeOptions({
        groups: ['me'],
    })
    @Post('refresh')
    @UseGuards(AuthGuard('jwt-refresh'))
    @HttpCode(HttpStatus.OK)
    public refresh(@Request() request): Promise<RefreshResponseDto> {
        return this.service.refreshToken({
            sessionId: request.user.sessionId,
            hash: request.user.hash,
        });
    }

    @ApiBearerAuth()
    @Post('logout')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    public async logout(@Request() request): Promise<SuccessDTO> {
        await this.service.logout({
            sessionId: request.user.sessionId,
        });

        return {done: true};
    }

    @ApiBearerAuth()
    @SerializeOptions({
        groups: ['me'],
    })
    @Patch('me')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    @ApiOkResponse({
        type: User,
    })
    public update(
        @Request() request,
        @Body() userDto: AuthUpdateDto,
    ): Promise<NullableType<User>> {
        return this.service.update(request.user, userDto);
    }

    @ApiBearerAuth()
    @Delete('me')
    @UseGuards(AuthGuard('jwt'))
    @HttpCode(HttpStatus.OK)
    public async delete(@Request() request): Promise<SuccessDTO> {
        await this.service.softDelete(request.user);
        return { done: true };
    }
}
