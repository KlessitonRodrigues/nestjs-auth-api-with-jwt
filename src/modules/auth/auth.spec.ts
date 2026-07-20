import { apiMessage } from '@packages/common-resources';
import axios from 'axios';
import { randomUUID } from 'node:crypto';

import dotenv from '../../constants/dotenv';
import { SignInDto, SignUpDto } from './dto/auth.dto';

describe('Auth API', () => {
  const baseURL = dotenv.BASE_URL;
  if (!baseURL) throw new Error('missing BASE_URL');

  const apiClient = axios.create({ baseURL });
  const testId = randomUUID().replace(/-/g, '');

  const signUpDto: SignUpDto = {
    name: `John Doe ${testId}`,
    email: `john${testId}@email.com`,
    password: 'password123',
  };

  const signInDto: SignInDto = {
    email: signUpDto.email,
    password: signUpDto.password,
  };

  let createdUserId: number;
  let resetToken: string;

  it('should sign up a new user and return 201 status', async () => {
    const response = await apiClient.post('/auth/signup', signUpDto);

    expect(response.status).toBe(201);
    expect(response.data).toMatchObject({
      name: signUpDto.name,
      email: signUpDto.email,
    });

    const usersResponse = await apiClient.get('/users');
    const createdUser = usersResponse.data.find(
      (u: { email: string; id: number }) => u.email === signUpDto.email,
    );
    if (createdUser) createdUserId = createdUser.id;
  });

  it('should sign in with valid credentials and return 200 with accessToken', async () => {
    const response = await apiClient.post('/auth/signin', signInDto);

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({
      email: signInDto.email,
    });
    expect(response.data).toHaveProperty('accessToken');
    expect(response.data).toHaveProperty('name');
  });

  it('should sign out and return 200', async () => {
    const response = await apiClient.post('/auth/signout');

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject(apiMessage.SUCCESS);
  });

  it('should refresh token and return 200 with new accessToken', async () => {
    const signInResponse = await apiClient.post('/auth/signin', signInDto);
    const validAccessToken = signInResponse.data.accessToken;

    const response = await apiClient.post('/auth/refresh-token', {
      accessToken: validAccessToken,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('accessToken');
  });

  it('should send recovery code and return 200', async () => {
    const response = await apiClient.post('/auth/send-recovery-code', {
      email: signUpDto.email,
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('message');
    expect(response.data.message).toBeTruthy();
  });

  it('should verify recovery code and return 200', async () => {
    const sendCodeResponse = await apiClient.post('/auth/send-recovery-code', {
      email: signUpDto.email,
    });
    const recoveryCode = sendCodeResponse.data.data.token;

    const response = await apiClient.post('/auth/verify-recovery-code', {
      email: signUpDto.email,
      code: recoveryCode,
    });

    resetToken = response.data.data.token; // Store the token for the reset password test

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('data');
    expect(response.data.data).toHaveProperty('token');
    expect(response.data.data.token).toBeTruthy();
  });

  it('should reset password and return 200', async () => {
    const response = await apiClient.post('/auth/reset-password', {
      token: resetToken,
      newPassword: 'newPassword123',
    });

    expect(response.status).toBe(200);
    expect(response.data).toMatchObject({ ...apiMessage.PASSWORD_RESET_SUCCESSFULLY });
  });

  it('should sign in with Google and return 200', async () => {
    const response = await apiClient.post('/auth/google', {
      accessToken: 'FAKE_ACCESS_TOKEN',
    });

    expect(response.status).toBe(200);
    expect(response.data).toHaveProperty('accessToken');
    expect(response.data).toHaveProperty('email');
    expect(response.data).toHaveProperty('name');
  });

  it('should return 400 for invalid sign up data', async () => {
    const invalidSignUpDto = {
      name: '',
      email: 'invalid-email',
      password: 'short',
    };

    await expect(apiClient.post('/auth/signup', invalidSignUpDto)).rejects.toMatchObject({
      response: {
        status: 400,
      },
    });
  });

  it('should return 400 for invalid sign in data', async () => {
    const invalidSignInDto = {
      email: 'not-an-email',
      password: '',
    };

    await expect(apiClient.post('/auth/signin', invalidSignInDto)).rejects.toMatchObject({
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
