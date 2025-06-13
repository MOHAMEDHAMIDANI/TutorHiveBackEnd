import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/domain/user';

export interface ChatUser {
    id: string | number;
    username: string;
    email: string;
    bio: string | null;
    avatarUrl: string | null;
    online: boolean;
}

export class LoginResponseDto {
  @ApiProperty()
  token: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenExpires: number;

  @ApiProperty({
    type: () => User,
  })
  user: User;

  @ApiProperty()
  chatUser?: ChatUser | null;
}
