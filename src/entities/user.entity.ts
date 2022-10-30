import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { USER_STATUS } from '../_common/enum/status.enum';
import { UserSocialEntity } from './user-social.entity';

@Entity('user')
export class UserEntity {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  userId: number;

  @Column({ name: 'nickname' })
  nickname: string;

  @Column('enum', { enum: USER_STATUS, name: 'user_status' })
  userStatus: USER_STATUS;

  @Column({ name: 'user_level' })
  userLevel: number;

  @Column({ name: 'profile_url', nullable: true })
  profileUrl?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'modified_at', nullable: true })
  modifiedAt?: Date;

  @OneToMany(() => UserSocialEntity, _ => _.userInfo)
  userSocialList?: UserSocialEntity[];
}
