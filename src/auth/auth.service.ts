import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { GoogleLoginDto, GoogleLoginResponseDto } from './dto/google-login.dto';
import { GoogleService } from './google.service';
import { SocialLoginPayloadType } from '../_common/types/social-payload.type';
import { validateUserStatus } from '../_common/utils/utils';
import { AuthRepository } from '../repositories/auth.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly jwtService: JwtService,
    private readonly googleService: GoogleService,
  ) {}

  async authGoogle({ credential }: GoogleLoginDto): Promise<GoogleLoginResponseDto> {
    const payload = await this.googleService.getSocialPayload({ credential });

    return this.authSocial(payload);
  }

  private async authSocial(payload: SocialLoginPayloadType): Promise<GoogleLoginResponseDto> {
    const userInfo = await this.authRepository.getUserBySocialKey(payload.socialType, payload.socialKey);

    if (userInfo) {
      validateUserStatus(userInfo.userStatus);

      const accessToken = await this.createAccessToken(userInfo);

      return { isNewUser: false, accessToken };
    } else {
      const userSocialId = await this.saveSocial(payload);

      return { isNewUser: true, userSocialId };
    }
  }

  private async createAccessToken({ userId }: any): Promise<string> {
    return this.jwtService.signAsync({ userId });
  }

  private async saveSocial({ socialType, socialKey }: SocialLoginPayloadType): Promise<number> {
    const { userSocialId } = (await this.authRepository.getUserSocialBySocialKey(socialType, socialKey)) ?? {};

    const userSocialInfo = await this.authRepository.saveUserSocial(
      Object.assign(
        {
          socialType,
          socialKey,
        },
        userSocialId ? { userSocialId } : null,
      ),
    );
    if (!userSocialInfo) throw new BadRequestException('DB Error [social].');

    return userSocialInfo.userSocialId;
  }
}
