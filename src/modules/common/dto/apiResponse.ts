import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export class SuccessDto extends createZodDto(
  z.object({
    message: z.string(),
    code: z.string().optional(),
    data: z.any().optional(),
  }),
) {}

export class ErrorDto extends createZodDto(
  z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.any().optional(),
  }),
) {}
