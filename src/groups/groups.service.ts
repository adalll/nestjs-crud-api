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

  async createGroup(createGroupDto: CreateGroupDto): Promise<Group> {
    const { title, users } = createGroupDto;

    const group = new Group();
    group.id = uuid();
    group.title = title;
    group.users = [];

    if (users) {
      // Add group to users from list
      for (const user of users) {
        //Check if user exist
        const found = await this.usersService.getUser(user);
        if (found) {
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

  async getGroups(): Promise<Group[]> {
    return await this.groupRepository.find();
  }

  async getGroup(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({ id });
    if (!group) {
      throw new NotFoundException(`Group with id ${id} not found!`);
    }
    return group;
  }

  async updateGroup(id: string, updateGroupDto: UpdateGroupDto): Promise<Group> {

    const { title, users } = updateGroupDto;
    const group = await this.getGroup(id);
    if (title) {
      group.title = title;
    }
    // If replace list of users in group
    if (users) {
      // Add group to users from new list
      for (const user of users) {
        // Check if we have new user not in old users list
        if (group.users.indexOf(user) === -1) {
          // Check if user exist
          const found = await this.usersService.getUser(user);
          if (found) {
            await this.usersService.addGroupToUser(user, group.id);
          }
        }
      }
      // Remove group from users from old list
      for (const user of group.users) {
        // Check if group from old list not in new list
        if (users.indexOf(user) === -1) {
          await this.usersService.deleteGroupFromUser(user, group.id);
        }
      }
      group.users = users;
    }
    await group.save();
    return group;
  }

  async deleteGroup(id: string): Promise<void> {
    const group = await this.getGroup(id);
    // Remove deleted group from all users
    for (const user of group.users) {
      await this.usersService.deleteGroupFromUser(user, group.id);
    }
    await this.groupRepository.remove(group);
  }

  async addUserToGroup(userId: string, groupId: string): Promise<void> {
    const group = await this.getGroup(groupId);
    group.users.push(userId);
    await group.save();
  }

  async deleteUserFromGroup(userId: string, groupId: string): Promise<void> {
    const group = await this.getGroup(groupId);
    group.users = group.users.filter(user => user !== userId);
    await group.save();
  }
}
