import { Entity, Column, PrimaryKey } from '../decorators';

@Entity({ tableName: 'users' })
export class User {
  @PrimaryKey({ type: 'number', generated: true })
  id!: number;

  @Column({ type: 'string', length: 100 })
  name!: string;

  @Column({ type: 'string', unique: true })
  email!: string;

  @Column({ type: 'string' })
  password!: string;

  @Column({ type: 'boolean', defaultValue: true })
  active!: boolean;

  @Column({ type: 'date' })
  createdAt!: Date;

  @Column({ type: 'date' })
  updatedAt!: Date;
}