import { Args, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { Group } from './group.entity';
import { GroupType } from './group.type';
import { CreateGroupInput } from './create-group.input';
import { GroupsService } from '../groups/groups.service';
import { UsersService } from '../users/users.service';
import { UserType } from '../users/user.type';
import { UpdateUserInput } from '../users/update-user.input';
import { UpdateGroupInput } from './update-group.input';

@Resolver(of => GroupType)
export class GroupResolver {

  constructor(
    private  usersService: UsersService,
    private  groupsService: GroupsService,
  ) {
  }

  @Query(returns => GroupType)
  group(
    @Args('id') id: string,
  ) {
    return this.groupsService.getGroup(id);
  }

  @Query(returns => [GroupType])
  groups() {
    return this.groupsService.getGroups();
  }

  @Mutation(returns => GroupType)
  createGroup(
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
  ) {
    return this.groupsService.createGroup(createGroupInput);
  }

  @Mutation(returns => GroupType)
  updateGroup(
    @Args('id') id: string,
    @Args('updateGroupInput') updateGroupInput: UpdateGroupInput,
  ) {
    return this.groupsService.updateGroup(id, updateGroupInput);
  }

  @Mutation(returns => GroupType)
  deleteGroup(
    @Args('id') id: string,
  ) {
    return this.groupsService.deleteGroup(id);
  }

  @ResolveField()
  async users(@Parent() group: Group) {
    return this.usersService.getManyUsers(group.users);
  }
}
