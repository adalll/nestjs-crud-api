import { BaseEntity, Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  groups: string[];

  @Column()
  friends: string[];
}
