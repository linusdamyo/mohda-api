import { INestApplication, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource, In } from 'typeorm';
import request from 'supertest';
import { GoogleService } from '../src/auth/google.service';
import { SOCIAL_TYPE } from '../src/_common/enum/type.enum';
import { SOCIAL_STATUS, USER_STATUS } from '../src/_common/enum/status.enum';
import { UserSocialEntity } from '../src/entities/user-social.entity';
import { UserEntity } from '../src/entities/user.entity';
import { createTestingApp } from './_utils/create-testing-app';

describe('AuthModule (e2e)', () => {
  let app: INestApplication;
  let googleService: GoogleService;
  let dataSource: DataSource;
  const userSocialIdSet = new Set<number>();
  const userIdSet = new Set<number>();

  beforeAll(async () => {
    app = await createTestingApp();

    googleService = app.get(GoogleService);
    dataSource = app.get(DataSource);

    jest.spyOn(googleService, 'getSocialPayload').mockImplementation(() =>
      Promise.resolve({
        socialType: SOCIAL_TYPE.GOOGLE,
        socialKey: 'google_id',
      }),
    );
  });

  describe('POST /api/auth/google', () => {
    it('처음 구글 ID 연동', async () => {
      const res = await request(app.getHttpServer()).post('/api/auth/google').send({ credential: '123456' }).expect(HttpStatus.CREATED);

      expect(res.body.isNewUser).toBe(true);
      expect(res.body).toHaveProperty('userSocialId');

      userSocialIdSet.add(res.body.userSocialId);
      expect(userSocialIdSet.size).toEqual(1);

      const userSocialInfo = await dataSource.getRepository(UserSocialEntity).findOneBy({ userSocialId: res.body.userSocialId });
      expect(userSocialInfo.socialKey).toEqual('google_id');
      expect(userSocialInfo.socialStatus).toEqual(SOCIAL_STATUS.NORMAL);
    });

    it('카카오 ID 연동만 한 경우, user_social 테이블은 기존꺼를 활용', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/google')
        .send({ code: '123456', redirectUri: 'https://amoo_url' })
        .expect(HttpStatus.CREATED);

      expect(res.body.isNewUser).toBe(true);
      expect(res.body).toHaveProperty('userSocialId');

      userSocialIdSet.add(res.body.userSocialId);
      expect(userSocialIdSet.size).toEqual(1);

      const userSocialInfo = await dataSource.getRepository(UserSocialEntity).findOneBy({ userSocialId: res.body.userSocialId });
      expect(userSocialInfo.socialKey).toEqual('google_id');
      expect(userSocialInfo.socialStatus).toEqual(SOCIAL_STATUS.NORMAL);
    });

    describe('기존 회원인 경우', () => {
      beforeAll(async () => {
        const userInfo = await dataSource.getRepository(UserEntity).save({ userStatus: USER_STATUS.NORMAL });
        await dataSource.getRepository(UserSocialEntity).update({ userSocialId: userSocialIdSet.values().next().value }, { userId: userInfo.userId });
        userIdSet.add(userInfo.userId);
      });

      it('기존 회원은 로그인 처리', async () => {
        const res = await request(app.getHttpServer())
          .post('/api/auth/google')
          .send({ code: '123456', redirectUri: 'https://amoo_url' })
          .expect(HttpStatus.CREATED);

        expect(res.body.isNewUser).toBe(false);
        expect(res.body).toHaveProperty('accessToken');

        const { accessToken } = res.body;
        const { userId } = new JwtService().verify(accessToken, { secret: process.env.JWT_SECRET });

        expect(userId).toEqual(userIdSet.values().next().value);
      });
    });
  });

  afterAll(async () => {
    await dataSource.getRepository(UserSocialEntity).delete({ userSocialId: In([...userSocialIdSet]) });
    await dataSource.getRepository(UserEntity).delete({ userId: In([...userIdSet]) });

    await app.close();
  });
});
