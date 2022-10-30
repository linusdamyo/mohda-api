import { Controller, Post, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { GoogleLoginDto, GoogleLoginResponseDto } from './dto/google-login.dto';

@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiTags('Auth')
  @ApiOperation({ summary: '구글 로그인' })
  @ApiResponse({ type: GoogleLoginResponseDto })
  @Post('/google')
  async authGoogle(@Body() body: GoogleLoginDto): Promise<GoogleLoginResponseDto> {
    return this.authService.authGoogle(body);
  }
}
