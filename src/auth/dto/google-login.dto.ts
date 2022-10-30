import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
  @ApiProperty({ description: '구글 로그인 credential' })
  @IsNotEmpty()
  @IsString()
  credential: string;
}

export class GoogleLoginResponseDto {
  @ApiProperty({ description: '신규 회원인 경우 true' })
  isNewUser: boolean;

  @ApiPropertyOptional({ description: '신규 회원인 경우, userSocialId' })
  userSocialId?: number;

  @ApiPropertyOptional({ description: '기존 회원인 경우: JWT access token' })
  accessToken?: string;
}
