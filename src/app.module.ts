import { Module } from '@nestjs/common';

import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { SwaggerModule } from './modules/docs/swegger.module';
import { UserModule } from './modules/users/user.module';

@Module({
  imports: [DatabaseModule, SwaggerModule, UserModule, AuthModule],
  providers: [],
})
export class AppModule {}
