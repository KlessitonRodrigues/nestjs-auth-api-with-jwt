import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiMessage } from '@packages/common-resources';
import { Repository } from 'typeorm';

import { ErrorDto, SuccessDto } from '../common/dto/apiResponse';
import { CreateUserDto, GetUserResponseDto, PatchUserDto, UpdateUserDto } from './dto/user.dto';
import { UserEntity } from './entity/user.entity';

interface IUserService {
  findAll(): Promise<GetUserResponseDto[] | ErrorDto>;
  findOne(id: number): Promise<GetUserResponseDto | ErrorDto>;
  createUser(user: CreateUserDto): Promise<GetUserResponseDto | ErrorDto>;
  updateUser(id: number, user: UpdateUserDto): Promise<GetUserResponseDto | ErrorDto>;
  patchUser(id: number, user: PatchUserDto): Promise<GetUserResponseDto | ErrorDto>;
  deleteUser(id: number): Promise<SuccessDto | ErrorDto>;
}

@Injectable()
export class UserService implements IUserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findAll(): Promise<GetUserResponseDto[] | ErrorDto> {
    try {
      const dbUsers = await this.userRepository.find();
      return dbUsers.map(user => GetUserResponseDto.create(user));
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async findOne(id: number): Promise<GetUserResponseDto | ErrorDto> {
    try {
      const user = await this.userRepository.findOneBy({ id });
      if (!user) return ErrorDto.create({ ...apiMessage.USER_NOT_FOUND });
      return GetUserResponseDto.create(user);
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async createUser(user: CreateUserDto): Promise<GetUserResponseDto | ErrorDto> {
    try {
      const newUser = this.userRepository.create(user);
      const savedUser = await this.userRepository.save(newUser);
      return GetUserResponseDto.create(savedUser);
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async updateUser(id: number, user: UpdateUserDto): Promise<GetUserResponseDto | ErrorDto> {
    try {
      await this.userRepository.update(id, user);
      return this.findOne(id);
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async patchUser(id: number, user: PatchUserDto): Promise<GetUserResponseDto | ErrorDto> {
    try {
      const dbUser = await this.userRepository.findOneBy({ id });
      if (!dbUser) return ErrorDto.create({ ...apiMessage.USER_NOT_FOUND });

      const updatedUser = { ...dbUser, ...user };
      await this.userRepository.save(updatedUser);
      return this.findOne(id);
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async deleteUser(id: number): Promise<SuccessDto | ErrorDto> {
    try {
      const dbUser = await this.userRepository.findOneBy({ id });
      if (!dbUser) return ErrorDto.create({ ...apiMessage.USER_NOT_FOUND });

      await this.userRepository.delete(id);
      return SuccessDto.create({ ...apiMessage.DELETED_SUCCESSFULLY });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }
}
