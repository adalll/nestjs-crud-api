import { Field, ID, ObjectType } from '@nestjs/graphql';
import { UserType } from '../users/user.type';

@ObjectType('Group')
export class GroupType {
  @Field(type => ID)
  id: string;

  @Field()
  title: string;

  @Field(type => [UserType])
  users: string[];
}
