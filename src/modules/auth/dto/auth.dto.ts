import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const authSchema = {
  email: z.string().email(),
  password: z.string(),
  recoveryToken: z.string(),
  recoveryTokenExpiration: z.string(),
  name: z.string(),
  accessToken: z.string(),
};

export class SignInDto extends createZodDto(
  z.object({
    email: authSchema.email,
    password: authSchema.password,
  }),
) {}

export class SignInResponseDto extends createZodDto(
  z.object({
    accessToken: authSchema.accessToken,
    email: authSchema.email,
    name: authSchema.name,
  }),
) {}

export class SignUpDto extends createZodDto(
  z.object({
    name: authSchema.name,
    email: authSchema.email,
    password: authSchema.password,
  }),
) {}

export class SignUpResponseDto extends createZodDto(
  z.object({
    email: authSchema.email,
    name: authSchema.name,
  }),
) {}

export class RefreshTokenDto extends createZodDto(
  z.object({
    accessToken: authSchema.accessToken,
  }),
) {}

export class SendRecoveryCodeDto extends createZodDto(
  z.object({
    email: authSchema.email,
  }),
) {}

export class VerifyRecoveryCodeDto extends createZodDto(
  z.object({
    email: authSchema.email,
    code: authSchema.recoveryToken,
  }),
) {}

export class ResetPasswordDto extends createZodDto(
  z.object({
    token: authSchema.recoveryToken,
    newPassword: authSchema.password,
  }),
) {}

export class GoogleSignInDto extends createZodDto(
  z.object({
    accessToken: authSchema.accessToken,
  }),
) {}

export class GithubSignInDto extends createZodDto(
  z.object({
    code: z.string(),
  }),
) {}
