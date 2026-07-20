import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true, nullable: false, length: 255 })
  email!: string;

  @Column({ length: 255 })
  name!: string;

  @Column({ nullable: false, length: 255 })
  password!: string;

  @Column({ length: 255, nullable: true })
  recoveryToken!: string;

  @Column({ type: 'timestamp', nullable: true })
  recoveryTokenExpiration!: Date;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;
}
