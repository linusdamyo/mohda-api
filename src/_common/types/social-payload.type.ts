import { SOCIAL_TYPE } from '../enum/type.enum';

export type SocialLoginPayloadType = {
  socialType: SOCIAL_TYPE;
  socialKey: string;
};
