import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtTestController } from './jwt.controller';
import { JwtTestService } from './jwt.service';

@Module({
  imports: [
    // JwtModule.register({
    //   secret: 'jwt-secret-key',
    //   signOptions: { expiresIn: '1h' },
    // }),
  ],
  controllers: [JwtTestController],
  providers: [JwtTestService],
})
export class JwtTestModule {}