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
    const { title, users } = createGroupDto;

    const group = new Group();
    group.id = uuid();
    group.title = title;
    group.users = [];

    if (users) {
      // Filter duplicates
      const uniqUsers = users.filter((item, idx, arr) => arr.indexOf(item) === idx);
      // Add group to users from list
      for (const user of uniqUsers) {
        // Check if user exist
        if (await this.usersService.getUser(user)) {
          // Add group to users from list
          await this.usersService.addGroupToUser(user, group.id);
          // Add user to group's users
          group.users.push(user);
        }
      }
    }
    await group.save();
    return group;
  };

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {

    const { title, users } = updateGroupDto;

    const groupCopy = Object.assign(await this.getGroup(id, true));

    if (title) {
      groupCopy.title = title;
    }
    // If replace list of users in group
    if (users) {
      for (const user of users) {
        // Check if we have new user not in old users list
        if (groupCopy.users.indexOf(user) === -1) {
          // Check if user exist
          if (await this.usersService.getUser(user)) {
            // Add group to user from new list
            await this.usersService.addGroupToUser(user, groupCopy.id);
            // Add user to group users
            groupCopy.users.push(user);
          }
        }
      }
      for (const user of groupCopy.users) {
        // Check if user from old list not in new list
        if (users.indexOf(user) === -1) {
          if (await this.usersService.getUser(user)) {
            // Remove group from user who not in new list
            await this.usersService.deleteGroupFromUser(user, groupCopy.id);
            // Remove user from group users
            groupCopy.users = groupCopy.users.filter(item => item !== user);
          }
        }
      }
    }
    await groupCopy.save();
    return groupCopy;
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.getGroup(id, true);
    // Remove deleted group from all users
    for (const user of group.users) {
      await this.usersService.deleteGroupFromUser(user, group.id);
    }
    await this.groupRepository.remove(group);
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const groupCopy = Object.assign(await this.getGroup(groupId));
    groupCopy.users.push(userId);
    await groupCopy.save();
  }

  async deleteUserFromGroup(userId: string, groupId: string): Promise<void> {
    const groupCopy = Object.assign(await this.getGroup(groupId));
    groupCopy.users = groupCopy.users.filter(user => user !== userId);
    await groupCopy.save();
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
}
