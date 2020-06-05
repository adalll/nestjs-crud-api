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

  async getUser(id: string, throwError?: boolean): Promise<User> {
    const user = await this.userRepository.findOne({ id });
    if (!user && throwError) {
      throw new NotFoundException(`User with id ${id} not found!`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const { firstName, lastName, groupIds, friendIds } = createUserDto;
    const user = new User();
    user.id = uuid();
    user.firstName = firstName;
    user.lastName = lastName;
    user.groups = [];
    user.friends = [];

    if (groupIds) {
      const uniqExistingGroupIds = await this.groupsService.getUniqExistingGroupIds(groupIds);
      // Add user to groups from list
      await this.groupsService.addUserToGroups(uniqExistingGroupIds, user.id);
      // Add groups to user's groups
      user.groups = uniqExistingGroupIds;
    }

    if (friendIds) {
      const uniqExistingFriendIds = await this.getUniqExistingUserIds(friendIds);
      // Add user to friends from list
      await this.addUserToFriends(uniqExistingFriendIds, user.id);
      // Add friends to user's friends
      user.friends = uniqExistingFriendIds;
    }

    await user.save();
    return user;
  };

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<User> {

    const { firstName, lastName, groupIds, friendIds } = updateUserDto;
    const user = await this.getUser(id, true);

    if (firstName) {
      user.firstName = firstName;
    }
    if (lastName) {
      user.lastName = lastName;
    }
    // If replace list of groups in user
    if (groupIds) {

      const uniqExistingGroupIds = await this.groupsService.getUniqExistingGroupIds(groupIds);
      // Get new groups not in old groups list

      const groupIdsToAdd = this.subtractIdArrays(uniqExistingGroupIds, user.groups);
      // Add user to groups from new list
      await this.groupsService.addUserToGroups(groupIdsToAdd, user.id);

      // Get old groups not in new groups list
      const groupIdsToDelete = this.subtractIdArrays(user.groups, uniqExistingGroupIds);
      // Remove user from removed groups
      await this.groupsService.deleteUserFromGroups(groupIdsToDelete, user.id);

      // Replace user's groups list
      user.groups = uniqExistingGroupIds;

    }

    // If replace list of friends in user
    if (friendIds) {

      const uniqExistingFriendIds = await this.getUniqExistingUserIds(friendIds);
      // Add user to friends from new list
      const friendIdsToAdd = this.subtractIdArrays(uniqExistingFriendIds, user.friends);
      await this.addUserToFriends(friendIdsToAdd, user.id);
      // Remove user from friends who not in new list
      const friendIdsToDelete = this.subtractIdArrays(user.friends, uniqExistingFriendIds);
      await this.deleteUserFromFriends(friendIdsToDelete, user.id);
      // Replace friends list
      user.friends = uniqExistingFriendIds;

    }
    await user.save();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUser(id, true);
    // Remove deleted user from all groups
    await this.groupsService.deleteUserFromGroups(user.groups, user.id);
    // Remove deleted user from all friends
    await this.deleteUserFromFriends(user.friends, user.id);
    await this.userRepository.remove(user);
  }

  async addGroupToUsers(userIds: string[], groupId: string): Promise<void> {
    const users = await this.getManyUsers(userIds);
    const updatedUsers = users.map(user => {
      user.groups.push(groupId);
      return user;
    });
    await this.userRepository.save(updatedUsers);
  }

  async deleteGroupFromUsers(userIds: string[], groupId: string): Promise<void> {
    const users = await this.getManyUsers(userIds);
    const updatedUsers = users.map(user => {
      user.groups = user.groups.filter(group => group !== groupId);
      return user;
    });
    await this.userRepository.save(updatedUsers);
  }

  async addUserToFriends(friendIds: string[], userId: string): Promise<void> {
    const friends = await this.getManyUsers(friendIds);
    const updatedFriends = friends.map(friend => {
      friend.friends.push(userId);
      return friend;
    });
    await this.userRepository.save(updatedFriends);
  }

  async deleteUserFromFriends(friendIds: string[], userId: string): Promise<void> {
    const friends = await this.getManyUsers(friendIds);
    const updatedFriends = friends.map(friend => {
      friend.friends = friend.friends.filter(friend => friend !== userId);
      return friend;
    });
    await this.userRepository.save(updatedFriends);
  }

  async getManyUsers(usersIds: string[]): Promise<User[]> {
    return await this.userRepository.find({
      where: {
        id: {
          $in: usersIds,
        },
      },
    });
  }

  getUniqIds(ids: string[]): string[] {
    return ids.filter((item, idx, arr) => arr.indexOf(item) === idx);
  }

  subtractIdArrays(subtrahendArray: string[], subtractorArray: string[]) {
    return subtrahendArray.filter(id => subtractorArray.indexOf(id) === -1);
  }

  async getUniqExistingUserIds(ids: string[]): Promise<string[]> {
    const uniqUserIds = this.getUniqIds(ids);
    const existingUserIds = (await this.getManyUsers(ids)).map(user => user.id);
    if (uniqUserIds.length !== existingUserIds.length) {
      const userIdsNotFounded = this.subtractIdArrays(uniqUserIds, existingUserIds);
      throw new NotFoundException(`Invalid userIds array, next users not found: ${userIdsNotFounded.toString()}`);
    }
    return existingUserIds;
  }

}
