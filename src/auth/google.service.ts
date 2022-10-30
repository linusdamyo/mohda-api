import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { GoogleLoginDto } from './dto/google-login.dto';
import { SOCIAL_TYPE } from '../_common/enum/type.enum';
import { SocialLoginPayloadType } from '../_common/types/social-payload.type';

@Injectable()
export class GoogleService {
  #GOOGLE_CLIENT_ID: string;
  #client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.#GOOGLE_CLIENT_ID = this.configService.get('GOOGLE_CLIENT_ID');
    this.#client = new OAuth2Client(this.#GOOGLE_CLIENT_ID);
  }

  async getSocialPayload({ credential }: GoogleLoginDto): Promise<SocialLoginPayloadType> {
    const ticket = await this.#client.verifyIdToken({ idToken: credential, audience: this.#GOOGLE_CLIENT_ID });

    const payload = ticket.getPayload();

    console.log(payload);

    if (!payload?.sub) throw new UnauthorizedException('구글 로그인 실패 - 유저 정보가 없습니다.');

    return {
      socialType: SOCIAL_TYPE.GOOGLE,
      socialKey: payload.sub,
    };
  }
}
