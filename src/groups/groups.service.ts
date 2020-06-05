import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateGroupDto } from './dto/create-group.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { Group } from './group.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class GroupsService {

  constructor(
    @InjectRepository(Group) private groupRepository: Repository<Group>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {
  }

  async getGroups(): Promise<Group[]> {
    return await this.groupRepository.find();
  }

  async getGroup(id: string, throwError?: boolean): Promise<Group> {
    const group = await this.groupRepository.findOne({ id });
    if (!group && throwError) {
      throw new NotFoundException(`Group with id ${id} not found!`);
    }
    return group;
  }

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const { title, userIds } = createGroupDto;

    const group = new Group();
    group.id = uuid();
    group.title = title;
    group.users = [];

    if (!userIds || !userIds.length) {
      await group.save();
      return group;
    }

    const uniqExistingUserIds = await this.usersService.getUniqExistingUserIds(userIds);
    await this.usersService.addGroupToUsers(uniqExistingUserIds, group.id);
    group.users = uniqExistingUserIds;

    await group.save();
    return group;
  };


  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {
    const { title, userIds } = updateGroupDto;

    const group = await this.getGroup(id, true);

    if (title) {
      group.title = title;
    }

    if (!userIds || !userIds.length) {
      await group.save();
      return group;
    }

    // If replace list of users in group
    const uniqExistingUserIds = await this.usersService.getUniqExistingUserIds(userIds);
    // Get new users not in old users list
    const userIdsToAdd = this.usersService.subtractIdArrays(uniqExistingUserIds, group.users);
    // Add group to users from new list
    await this.usersService.addGroupToUsers(userIdsToAdd, group.id);

    // Get users from old list who not in new list
    const userIdsToDelete = this.usersService.subtractIdArrays(group.users, uniqExistingUserIds);
    // Remove group from users who not in new list
    await this.usersService.deleteGroupFromUsers(userIdsToDelete, group.id);
    group.users = uniqExistingUserIds;

    await group.save();
    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.getGroup(id, true);
    // Remove deleted group from all users
    await this.usersService.deleteGroupFromUsers(group.users, group.id);
    await this.groupRepository.remove(group);
  }


  async addUserToGroups(groupIds: string[], userId: string): Promise<void> {
    const groups = await this.getManyGroups(groupIds);
    const updatedGroups = groups.map(group => {
      group.users.push(userId);
      return group;
    });
    await this.groupRepository.save(updatedGroups);
  }

  async deleteUserFromGroups(groupIds: string[], userId: string): Promise<void> {
    const groups = await this.getManyGroups(groupIds);
    const updatedGroups = groups.map(group => {
      group.users = group.users.filter(user => user !== userId);
      return group;
    });
    await this.groupRepository.save(updatedGroups);
  }

  async getManyGroups(groupsIds: string[]): Promise<Group[]> {
    return this.groupRepository.find({
      where: {
        id: {
          $in: groupsIds,
        },
      },
    });
  }

  async getUniqExistingGroupIds(ids: string[]): Promise<string[]> {
    const uniqGroupIds = this.usersService.getUniqIds(ids);
    const existingGroupIds = (await this.getManyGroups(ids)).map(group => group.id);
    if (uniqGroupIds.length !== existingGroupIds.length) {
      const groupIdsNotFound = this.usersService.subtractIdArrays(uniqGroupIds, existingGroupIds);
      throw new NotFoundException(`Invalid groupIds array, next groups not found: ${groupIdsNotFound.toString()}`);
    }
    return existingGroupIds;
  }

}
