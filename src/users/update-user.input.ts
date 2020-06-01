import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID, MinLength } from 'class-validator';

@InputType()
export class UpdateUserInput {

  @IsOptional()
  @MinLength(1)
  @Field(() => String, {defaultValue : null})
  firstName: string;

  @IsOptional()
  @MinLength(1)
  @Field(() => String, {defaultValue : null})
  lastName: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  @Field(() => [ID], {defaultValue : null})
  groupIds: string[];

  @IsOptional()
  @IsUUID("4", {each: true})
  @Field(() => [ID], {defaultValue : null})
  friendIds: string[];
}
