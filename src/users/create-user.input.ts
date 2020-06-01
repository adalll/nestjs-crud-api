import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID, MinLength } from 'class-validator';

@InputType()
export class CreateUserInput {

  @MinLength(1)
  @Field()
  firstName: string;

  @MinLength(1)
  @Field()
  lastName: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  @Field(() => [ID], {defaultValue : []})
  groupIds: string[];

  @IsOptional()
  @IsUUID("4", {each: true})
  @Field(() => [ID], {defaultValue : []})
  friendIds: string[];
}
