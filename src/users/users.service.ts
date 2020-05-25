import { forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { GroupsService } from '../groups/groups.service';

@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
  ) {
  }

  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ id });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found!`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, groups, friends } = createUserDto;
    const user = new User();
    user.id = uuid();
    user.firstName = firstName;
    user.lastName = lastName;
    user.groups = [];

    if (groups) {
      for (const group of groups) {
        //Check if group exist
        const found = await this.groupsService.getGroup(group);
        if (found) {
          // Add user to groups from list
          await this.groupsService.addUserToGroup(user.id, group);
          // Add group to user's groups
          user.groups.push(group);
        }
      }
    }

    user.friends = [];

    if (friends) {
      for (const friend of friends) {
        //Check if user exist
        const found = await this.getUser(friend);
        if (found) {
          // Add user to friends from list
          await this.addUserToFriends(user.id, friend);
          // Add friend to friends list
          user.friends.push(friend);
        }
      }
    }
    await user.save();
    return user;
  };

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    const { firstName, lastName, groups, friends } = updateUserDto;
    const userCopy = await this.copyUser(id);

    if (firstName) {
      userCopy.firstName = firstName;
    }
    if (lastName) {
      userCopy.lastName = lastName;
    }
    // If replace list of groups in user
    if (groups) {
      // Add user to added groups
      for (const group of groups) {
        // Check if we have new group not in old groups list
        if (userCopy.groups.indexOf(group) === -1) {
          // Check if group exist
          const found = await this.groupsService.getGroup(group);
          if (found) {
            await this.groupsService.addUserToGroup(userCopy.id, group);
          }
        }
      }
      // Remove user from removed groups
      for (const group of userCopy.groups) {
        // Check if group from old list not in new list
        if (groups.indexOf(group) === -1) {
          await this.groupsService.deleteUserFromGroup(userCopy.id, group);
        }
      }
      userCopy.groups = groups;
    }

    // If replace list of friends in user
    if (friends) {

      // Add user to friends from new list
      for (const friend of friends) {
        // Check if we have new friend not in old friends list
        if (userCopy.friends.indexOf(friend) === -1) {
          // Check if user exist
          const found = await this.getUser(friend);
          if (found) {
            await this.addUserToFriends(userCopy.id, friend);
          }
        }
      }
      // Remove user from removed friends
      for (const friend of userCopy.friends) {
        if (friends.indexOf(friend) === -1) {
          await this.deleteUserFromFriends(userCopy.id, friend);
        }
      }
      userCopy.friends = friends;
    }
    await userCopy.save();
    return userCopy;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id);
    // Remove deleted user from all groups
    for (const group of user.groups) {
      await this.groupsService.deleteUserFromGroup(user.id, group);
    }
    // Remove deleted user from all friends
    for (const friend of user.friends) {
      await this.deleteUserFromFriends(user.id, friend);
    }
    await this.userRepository.remove(user);
  }


  async addGroupToUser(userId: string, groupId: string): Promise<void> {
    const userCopy = await this.copyUser(userId);
    userCopy.groups.push(groupId);
    await userCopy.save();
  }

  async deleteGroupFromUser(userId: string, groupId: string): Promise<void> {
    const userCopy = await this.copyUser(userId);
    userCopy.groups = userCopy.groups.filter(group => group !== groupId);
    await userCopy.save();
  }

  async addUserToFriends(userId: string, recieverUserId: string): Promise<void> {
    const userCopy = await this.copyUser(recieverUserId);
    userCopy.friends.push(userId);
    await userCopy.save();
  }

  async deleteUserFromFriends(userId: string, recieverUserId: string): Promise<void> {
    const userCopy = await this.copyUser(recieverUserId);
    userCopy.friends = userCopy.friends.filter(friend => friend !== userId);
    await userCopy.save();
  }

  async copyUser(userId): Promise<User> {
    return Object.assign(await this.getUser(userId));
  }

  async getManyUsers(usersIds: string[]): Promise<User[]> {
    return this.userRepository.find({
      where: {
        id: {
          $in: usersIds,
        },
      },
    });
  }

}
