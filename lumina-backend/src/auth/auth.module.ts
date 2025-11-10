import { Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaService } from '../prisma/prisma.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { SessionAuthGuard } from './session-auth.guard'; // ajustar caminho se necessário

@Module({
  imports: [
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_KEY,
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    GoogleStrategy,
    PrismaService,
    AuthService,
    JwtService,
    SessionAuthGuard, // exposto como provider para uso em UseGuards
  ],
  exports: [AuthService],
})
export class AuthModule {}
