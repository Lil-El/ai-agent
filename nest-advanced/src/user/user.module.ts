import { Module } from '@nestjs/common';
import { AuthGuard } from '../common/guards/auth.guard';
import { UserService } from './user.service';
import { UserController } from './user.controller';

@Module({
  controllers: [UserController],
  providers: [UserService, AuthGuard],
})
export class UserModule {}
