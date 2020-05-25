import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID, MinLength } from 'class-validator';

@InputType()
export class CreateGroupInput {

  @MinLength(1)
  @Field()
  title: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  @Field(() => [ID], {defaultValue : []})
  users: string[];

}
