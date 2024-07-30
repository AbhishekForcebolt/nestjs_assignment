import { UserSchema } from '../user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'BlockedUser' })
export class BlockedUserSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({})
  user_id: string;

  @ManyToMany(() => UserSchema)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'user_id',
  })
  user: UserSchema;

  @Column({})
  blocked_user_id: string;

  @ManyToMany(() => UserSchema)
  @JoinColumn({
    referencedColumnName: 'id',
    name: 'blocked_user_id',
  })
  blocked_user: UserSchema;

  @Column({ default: new Date() })
  blocked_at: Date;
}
