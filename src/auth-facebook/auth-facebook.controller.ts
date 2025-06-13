import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  SerializeOptions,
} from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AuthFacebookService } from './auth-facebook.service';
import { AuthFacebookLoginDto } from './dto/auth-facebook-login.dto';
import { LoginResponseDto } from '../auth/dto/login-response.dto';
import axios from 'axios';

// Define the ChatUserResponse interface
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

@ApiTags('Auth')
@Controller({
  path: 'auth/facebook',
  version: '1',
})
export class AuthFacebookController {
  constructor(
    private readonly authService: AuthService,
    private readonly authFacebookService: AuthFacebookService,
  ) {}

  @ApiOkResponse({
    type: LoginResponseDto,
  })
  @SerializeOptions({
    groups: ['me'],
  })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: AuthFacebookLoginDto,
  ): Promise<LoginResponseDto> {
    const socialData =
      await this.authFacebookService.getProfileByToken(loginDto);

    // Get the authentication result from validateSocialLogin
    const authResult = await this.authService.validateSocialLogin('facebook', socialData);
    
    // Generate a password for chat user - consistent based on social ID for repeat logins
    const chatPassword = `facebook_${socialData.id}`;
    let chatUser: ChatUserResponse | null = null;
    
    try {
      // First try to login with the email and password
      try {
        console.log("Attempting to login Facebook user on chat server:", socialData.email);
        
        const chatLoginResponse = await axios.post<ChatUserResponse>(`${process.env.CHAT_API_URL}/auth/login`, {
          email: socialData.email,
          password: chatPassword,
        });
      
        chatUser = chatLoginResponse.data;
        console.log("Chat login successful. Response:", chatUser);
      } catch (loginError) {
        // If login fails, register the user on chat server
        console.log("Chat login failed, user doesn't exist. Registering new user:", loginError.message);
        
        const chatRegisterResponse = await axios.post<ChatUserResponse>(`${process.env.CHAT_API_URL}/auth/register`, {
          email: socialData.email,
          username: `${socialData.firstName || ''} ${socialData.lastName || ''}`.trim(),
          password: chatPassword,
        });
        
        chatUser = chatRegisterResponse.data;
        console.log("Chat user registration successful. Response:", chatUser);
      }
    } catch (error) {
      console.error('Failed to handle chat user:', {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data
      });
    }
    
    // Add chat user to the response
    if (chatUser) {
      authResult.chatUser = {
        id: parseInt(chatUser.user.id),
        username: chatUser.user.username || "",
        email: chatUser.user.email || "",
        bio: chatUser.user.bio || "",
        avatarUrl: chatUser.avatarUrl || "",
        online: chatUser.online || false
      };
    }
    
    return authResult;
  }
}
