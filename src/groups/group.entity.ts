import { BaseEntity, Column, Entity, ObjectIdColumn, PrimaryColumn } from 'typeorm';

@Entity()
export class Group extends BaseEntity {
  @ObjectIdColumn()
  _id: string;

  @PrimaryColumn()
  id: string;

  @Column()
  title: string;

  @Column()
  users: string[];
}
