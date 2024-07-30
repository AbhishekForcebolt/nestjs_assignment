import { BlockedUserSchema } from '../block_user/block.entity';
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'User' })
export class UserSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  first_name: string;

  @Column()
  surname: string;

  @Column()
  last_name: string;

  @Column({ unique: true })
  username: string;

  @Column()
  birthday: Date;

  @Column({ default: new Date() })
  created_at: Date;

  @Column({ default: null })
  updated_at: Date;

  @OneToOne(() => BlockedUserSchema, (blockedUser) => blockedUser.user)
  blockedUser: BlockedUserSchema;
}
