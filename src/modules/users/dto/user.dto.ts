import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const userSchema = {
  id: z.number().int(),
  email: z.string().email().max(128),
  password: z.string().min(8).max(128),
  name: z.string().max(128),
  createdAt: z.date(),
  updatedAt: z.date(),
};

export class GetUserResponseDto extends createZodDto(
  z.object({
    id: userSchema.id,
    name: userSchema.name,
    email: userSchema.email,
    createdAt: userSchema.createdAt,
    updatedAt: userSchema.updatedAt,
  }),
) {}

export class CreateUserDto extends createZodDto(
  z.object({
    name: userSchema.name,
    email: userSchema.email,
    password: userSchema.password,
  }),
) {}

export class UpdateUserDto extends createZodDto(
  z.object({
    name: userSchema.name,
    email: userSchema.email,
  }),
) {}

export class PatchUserDto extends createZodDto(
  z.object({
    name: userSchema.name.optional(),
    email: userSchema.email.optional(),
  }),
) {}
