import { Body, Controller, Delete, Get, Param, Patch, Post, Put, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { CreateUserDto } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: number) {
    return this.userService.findOne(id);
  }

  @Post()
  @UsePipes(ZodValidationPipe)
  async createUser(@Body() user: CreateUserDto) {
    return this.userService.createUser(user);
  }

  @Put(':id')
  @UsePipes(ZodValidationPipe)
  async updateUser(@Param('id') id: number, @Body() user: CreateUserDto) {
    return this.userService.updateUser(id, user);
  }

  @Patch(':id')
  @UsePipes(ZodValidationPipe)
  async patchUser(@Param('id') id: number, @Body() user: CreateUserDto) {
    return this.userService.patchUser(id, user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return await this.userService.deleteUser(id);
  }
}
