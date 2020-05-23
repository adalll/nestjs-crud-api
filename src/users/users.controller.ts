
import { UsersService } from './users.service';
import { User } from './user.entity';
import { GetUsersFilterDto } from './dto/get-users-filter.dto';
import { CreateUserDto } from './dto/create-user-dto';
import { Body, Controller, Get, Post, Query, UsePipes, ValidationPipe } from '@nestjs/common';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {
  }

  @Get()
  getUsers(@Query(ValidationPipe) filterDto: GetUsersFilterDto): Promise<User[]> {
    return this.usersService.getUsers(filterDto);
  }
  //
  // @Get('/:id')
  // getTaskById(@Param('id', ParseIntPipe) id: number): Promise<Task> {
  //   return this.taskService.getTaskById(id);
  // }

  @Post()
  @UsePipes(ValidationPipe)
  createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(createUserDto);
  }

  // @Patch('/:id/status')
  // updateTaskStatus(
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body('status', TaskStatusValidationPipe) status: TaskStatus,
  // ): Promise<Task> {
  //   return this.taskService.updateTaskStatus(id, status);
  // }
  //
  // @Delete('/:id')
  // deleteTask(@Param('id', ParseIntPipe) id: number): Promise<void> {
  //   return this.taskService.deleteTask(id);
  // }

}
