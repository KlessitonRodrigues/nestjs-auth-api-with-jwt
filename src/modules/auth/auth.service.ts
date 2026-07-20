import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { apiMessage } from '@packages/common-resources';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { Repository } from 'typeorm';

import { ErrorDto, SuccessDto } from '../common/dto/apiResponse';
import { UserEntity } from '../users/entity/user.entity';
import {
  GithubSignInDto,
  GoogleSignInDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendRecoveryCodeDto,
  SignInDto,
  SignInResponseDto,
  SignUpDto,
  SignUpResponseDto,
  VerifyRecoveryCodeDto,
} from './dto/auth.dto';

const GOOGLE_USER_INFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';
const GITHUB_TOKEN_URL = 'https://github.com/login/oauth/access_token';
const GITHUB_EMAILS_URL = 'https://api.github.com/user/emails';

const getJwtSecret = () => process.env.JWT_SECRET || 'secret';

interface AuthServiceInterface {
  signIn(data: SignInDto): Promise<SignInResponseDto | ErrorDto>;
  signUp(data: SignUpDto): Promise<SignUpResponseDto | ErrorDto>;
  signOut(): Promise<SuccessDto | ErrorDto>;
  refresh(data: RefreshTokenDto): Promise<RefreshTokenDto | ErrorDto>;
  sendRecoveryCode(data: SendRecoveryCodeDto): Promise<SuccessDto | ErrorDto>;
  verifyRecoveryCode(data: VerifyRecoveryCodeDto): Promise<SuccessDto | ErrorDto>;
  resetPassword(data: ResetPasswordDto): Promise<SuccessDto | ErrorDto>;
  googleSignIn(data: GoogleSignInDto): Promise<SignInResponseDto | ErrorDto>;
  githubSignIn(data: GithubSignInDto): Promise<SignInResponseDto | ErrorDto>;
}

@Injectable()
export class AuthService implements AuthServiceInterface {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async signIn(data: SignInDto): Promise<SignInResponseDto | ErrorDto> {
    try {
      const user = await this.userRepository.findOne({ where: { email: data.email } });
      if (!user) return ErrorDto.create({ ...apiMessage.INVALID_CREDENTIALS });

      const isPasswordValid = await bcrypt.compare(data.password, user.password);
      if (!isPasswordValid) return ErrorDto.create({ ...apiMessage.INVALID_CREDENTIALS });

      const jwtData = { userId: user.id, email: user.email, name: user.name };
      const accessToken = jwt.sign(jwtData, getJwtSecret(), { expiresIn: '1h' });

      return SignInResponseDto.create({ accessToken, email: user.email, name: user.name });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async signUp(data: SignUpDto): Promise<SignUpResponseDto | ErrorDto> {
    try {
      const existingUser = await this.userRepository.findOne({ where: { email: data.email } });
      if (existingUser) return ErrorDto.create({ ...apiMessage.USER_ALREADY_EXISTS });

      const hashedPassword = await bcrypt.hash(data.password, 10);
      const newUser = this.userRepository.create({
        email: data.email,
        name: data.name,
        password: hashedPassword,
      });

      try {
        await this.userRepository.save(newUser);
      } catch (err: any) {
        const details = err instanceof Error ? err.message : err;
        return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
      }

      return SignUpResponseDto.create({ email: data.email, name: data.name });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async signOut(): Promise<SuccessDto | ErrorDto> {
    try {
      return SuccessDto.create({ ...apiMessage.SUCCESS });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async refresh(data: RefreshTokenDto): Promise<RefreshTokenDto | ErrorDto> {
    try {
      if (!data.accessToken) return ErrorDto.create({ ...apiMessage.INVALID_TOKEN });

      let decoded: any;
      try {
        decoded = jwt.verify(data.accessToken, getJwtSecret());
      } catch {
        return ErrorDto.create({ ...apiMessage.INVALID_TOKEN });
      }

      const jwtData = { userId: decoded.userId, email: decoded.email, name: decoded.name };
      const accessToken = jwt.sign(jwtData, getJwtSecret(), { expiresIn: '1h' });

      return RefreshTokenDto.create({ accessToken });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async sendRecoveryCode(data: SendRecoveryCodeDto): Promise<SuccessDto | ErrorDto> {
    try {
      const user = await this.userRepository.findOne({ where: { email: data.email } });
      if (!user) return ErrorDto.create({ ...apiMessage.USER_NOT_FOUND });

      const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
      const recoveryTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

      await this.userRepository.update(user.id, {
        recoveryToken: recoveryCode,
        recoveryTokenExpiration,
      });

      return SuccessDto.create({ ...apiMessage.SUCCESS, data: { token: recoveryCode } });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async verifyRecoveryCode(data: VerifyRecoveryCodeDto): Promise<SuccessDto | ErrorDto> {
    try {
      const user = await this.userRepository.findOne({ where: { email: data.email } });
      if (!user) return ErrorDto.create({ ...apiMessage.USER_NOT_FOUND });

      if (user.recoveryToken !== data.code || !user.recoveryTokenExpiration) {
        return ErrorDto.create({ ...apiMessage.INVALID_TOKEN });
      }

      if (new Date() > new Date(user.recoveryTokenExpiration)) {
        return ErrorDto.create({ ...apiMessage.EXPIRED_TOKEN });
      }

      const token = jwt.sign({ userId: user.id, email: user.email }, getJwtSecret(), {
        expiresIn: '15m',
      });

      return SuccessDto.create({ ...apiMessage.SUCCESS, data: { token } });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async resetPassword(data: ResetPasswordDto): Promise<SuccessDto | ErrorDto> {
    try {
      if (!data.token || !data.newPassword) return ErrorDto.create({ ...apiMessage.INVALID_TOKEN });

      let decoded: any;
      try {
        decoded = jwt.verify(data.token, getJwtSecret());
      } catch {
        return ErrorDto.create({ ...apiMessage.INVALID_TOKEN });
      }

      const hashedPassword = await bcrypt.hash(data.newPassword, 10);
      await this.userRepository.update(decoded.userId, {
        password: hashedPassword,
        recoveryToken: '',
        recoveryTokenExpiration: undefined,
      });

      return SuccessDto.create({ ...apiMessage.PASSWORD_RESET_SUCCESSFULLY });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async googleSignIn(data: GoogleSignInDto): Promise<SignInResponseDto | ErrorDto> {
    try {
      const userInfoResponse = await fetch(GOOGLE_USER_INFO_URL, {
        headers: { Authorization: `Bearer ${data.accessToken}` },
      });

      if (userInfoResponse.status !== 200) {
        return ErrorDto.create({ ...apiMessage.UNAUTHORIZED });
      }

      const userData = await userInfoResponse.json();

      if (!userData?.verified_email) {
        return ErrorDto.create({ ...apiMessage.UNAUTHORIZED });
      }

      let user = await this.userRepository.findOne({ where: { email: userData.email } });
      if (!user) {
        const newUser = this.userRepository.create({
          email: userData.email,
          name: userData.name,
          password: await bcrypt.hash(crypto.randomUUID(), 10),
        });
        user = await this.userRepository.save(newUser);
      }

      const jwtData = { userId: user.id, email: user.email, name: user.name };
      const accessToken = jwt.sign(jwtData, getJwtSecret(), { expiresIn: '1h' });

      return SignInResponseDto.create({ accessToken, email: user.email, name: user.name });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }

  async githubSignIn(data: GithubSignInDto): Promise<SignInResponseDto | ErrorDto> {
    try {
      const tokenRes = await fetch(GITHUB_TOKEN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: data.code,
        }),
      });

      if (tokenRes.status !== 200) {
        return ErrorDto.create({ ...apiMessage.UNAUTHORIZED });
      }

      const tokenData = await tokenRes.json();
      if (!tokenData.access_token) {
        return ErrorDto.create({ ...apiMessage.INVALID_TOKEN });
      }

      const githubToken = tokenData.access_token;

      const emailResp = await fetch(GITHUB_EMAILS_URL, {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'task-manager-app',
        },
      });

      if (emailResp.status !== 200) {
        return ErrorDto.create({ ...apiMessage.UNAUTHORIZED });
      }

      const emails: any[] = await emailResp.json();
      const primaryEmail = emails.find(e => e.primary && e.verified);
      if (!primaryEmail) {
        return ErrorDto.create({ ...apiMessage.UNAUTHORIZED });
      }

      const userResp = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${githubToken}`,
          Accept: 'application/vnd.github+json',
        },
      });
      const githubUser = await userResp.json();

      let user = await this.userRepository.findOne({ where: { email: primaryEmail.email } });
      if (!user) {
        const newUser = this.userRepository.create({
          email: primaryEmail.email,
          name: githubUser.name || githubUser.login,
          password: await bcrypt.hash(crypto.randomUUID(), 10),
        });
        user = await this.userRepository.save(newUser);
      }

      const jwtData = { userId: user.id, email: user.email, name: user.name };
      const accessToken = jwt.sign(jwtData, getJwtSecret(), { expiresIn: '1h' });

      return SignInResponseDto.create({ accessToken, email: user.email, name: user.name });
    } catch (error) {
      const details = error instanceof Error ? error.message : error;
      return ErrorDto.create({ details, ...apiMessage.INTERNAL_SERVER_ERROR });
    }
  }
}
