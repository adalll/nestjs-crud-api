import { Field, ID, ObjectType } from '@nestjs/graphql';
import { GroupType } from '../groups/group.type';

@ObjectType('User')
export class UserType {
  @Field(type => ID)
  id: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field(type => [GroupType])
  groups: string[];

  @Field(type => [UserType])
  friends: string[];
}
