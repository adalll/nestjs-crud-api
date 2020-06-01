import { Field, ID, InputType } from '@nestjs/graphql';
import { IsOptional, IsUUID, MinLength } from 'class-validator';

@InputType()
export class UpdateGroupInput {

  @IsOptional()
  @MinLength(1)
  @Field(() => String, {defaultValue : null})
  title: string;

  @IsOptional()
  @IsUUID("4", {each: true})
  @Field(() => [ID], {defaultValue : null})
  userIds: string[];

}
