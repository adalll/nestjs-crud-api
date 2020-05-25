import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserType } from './user.type';
import { UsersService } from './users.service';
import { CreateUserInput } from './create-user.input';
import { User } from './user.entity';
import { GroupsService } from '../groups/groups.service';

@Resolver(of => UserType)
export class UserResolver {

  constructor(
    private  usersService: UsersService,
    private  groupsService: GroupsService,
  ) {
  }

  @Query(returns => UserType)
  user(
    @Args('id') id: string,
  ) {
    return this.usersService.getUser(id);
  }

  @Query(returns => [UserType])
  users() {
    return this.usersService.getUsers();
  }

  @Mutation(returns => UserType)
  createUser(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ) {
    return this.usersService.createUser(createUserInput);
  }

  @ResolveField()
  async friends(@Parent() user: User) {
    return this.usersService.getManyUsers(user.friends);
  }

  @ResolveField()
  async groups(@Parent() user: User) {
    return this.groupsService.getManyGroups(user.groups);
  }
}
