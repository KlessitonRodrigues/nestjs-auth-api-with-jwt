import { Body, Controller, HttpCode, Inject, Post, UsePipes } from '@nestjs/common';
import { ZodValidationPipe } from 'nestjs-zod';

import { AuthService } from './auth.service';
import {
  GoogleSignInDto,
  RefreshTokenDto,
  ResetPasswordDto,
  SendRecoveryCodeDto,
  SignInDto,
  SignUpDto,
  VerifyRecoveryCodeDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {}

  @Post('signin')
  @HttpCode(200)
  @UsePipes(ZodValidationPipe)
  signIn(@Body() body: SignInDto) {
    return this.authService.signIn(body);
  }

  @Post('signup')
  @HttpCode(201)
  @UsePipes(ZodValidationPipe)
  signUp(@Body() body: SignUpDto) {
    return this.authService.signUp(body);
  }

  @Post('signout')
  @HttpCode(200)
  signOut() {
    return this.authService.signOut();
  }

  @Post('refresh-token')
  @HttpCode(200)
  @UsePipes(ZodValidationPipe)
  refresh(@Body() body: RefreshTokenDto) {
    return this.authService.refresh(body);
  }

  @Post('send-recovery-code')
  @HttpCode(200)
  @UsePipes(ZodValidationPipe)
  sendRecoveryCode(@Body() body: SendRecoveryCodeDto) {
    return this.authService.sendRecoveryCode(body);
  }

  @Post('verify-recovery-code')
  @HttpCode(200)
  @UsePipes(ZodValidationPipe)
  verifyRecoveryCode(@Body() body: VerifyRecoveryCodeDto) {
    return this.authService.verifyRecoveryCode(body);
  }

  @Post('reset-password')
  @HttpCode(200)
  @UsePipes(ZodValidationPipe)
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.authService.resetPassword(body);
  }

  @Post('google')
  @HttpCode(200)
  @UsePipes(ZodValidationPipe)
  googleSignIn(@Body() body: GoogleSignInDto) {
    return this.authService.googleSignIn(body);
  }
}
