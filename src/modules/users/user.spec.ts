import { apiMessage } from '@packages/common-resources';
import axios from 'axios';
import { randomUUID } from 'node:crypto';

import dotenv from '../../constants/dotenv';
import { CreateUserDto } from './dto/user.dto';

describe('User API', () => {
  const baseURL = dotenv.BASE_URL;
  if (!baseURL) throw new Error('missing BASE_URL');

  const apiClient = axios.create({ baseURL });
  const testId = randomUUID().replace(/-/g, '');

  const createUserDto: CreateUserDto = {
    name: `John Doe ${testId}`,
    email: `john${testId}@email.com`,
    password: 'password123',
  };

  const updatedUserDto: CreateUserDto = {
    name: `Jane Doe ${testId}`,
    email: `jane${testId}@email.com`,
    password: 'password1234',
  };

  const patchedUserDto: CreateUserDto = {
    name: `Alex Doe ${testId}`,
    email: `alex${testId}@email.com`,
    password: 'password12345',
  };

  let createdUserId: number;

  it('should create a new user and return 201 status', async () => {
    const response = await apiClient.post('/users', createUserDto);

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      name: createUserDto.name,
      email: createUserDto.email,
    });
    expect(response.data).toHaveProperty('id');

    createdUserId = response.data.id;
  });

  it('should list users and include the created user', async () => {
    const response = await apiClient.get('/users');

    expect(response.status).toBe(200);
    expect(response.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: createdUserId,
          name: createUserDto.name,
          email: createUserDto.email,
        }),
      ]),
    );
  });

  it('should return a user by id', async () => {
    const response = await apiClient.get(`/users/${createdUserId}`);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      id: createdUserId,
      name: createUserDto.name,
      email: createUserDto.email,
    });
  });

  it('should update a user with put', async () => {
    const response = await apiClient.put(`/users/${createdUserId}`, updatedUserDto);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      id: createdUserId,
      name: updatedUserDto.name,
      email: updatedUserDto.email,
    });
  });

  it('should patch a user', async () => {
    const response = await apiClient.patch(`/users/${createdUserId}`, patchedUserDto);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      id: createdUserId,
      name: patchedUserDto.name,
      email: patchedUserDto.email,
    });
  });

  it('should delete a user and return a success message', async () => {
    const response = await apiClient.delete(`/users/${createdUserId}`);

    expect(response.status).toBe(200);
    expect(response.data).toEqual({ ...apiMessage.DELETED_SUCCESSFULLY });
  });

  it('should return 400 status for invalid user data', async () => {
    const invalidUserDto = {
      name: '',
      email: 'invalid-email',
      password: 'short',
    };

    await expect(apiClient.post('/users', invalidUserDto)).rejects.toMatchObject({
      response: {
        status: 400,
      },
    });
  });

  it('should clean up any test data', async () => {
    if (!createdUserId) return;
    await apiClient.delete(`/users/${createdUserId}`).catch(() => undefined);
  });
});
