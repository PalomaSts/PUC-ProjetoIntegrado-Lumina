import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Req,
  Res,
  UnauthorizedException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private prisma: PrismaService,
    private authService: AuthService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
    const { token, user } = await this.authService.signIn(req.user);

    const _sessionUser = {
      id: user?.id,
      email: user?.email,
      name: user?.name,
      picture: user?.picture ?? '',
    };

    res.cookie('token', token, {
      sameSite: 'lax',
      httpOnly: true,
      secure: false,
    });

    return res.json(user);
  }

  @Get('me')
  async getMe(@Req() req: any) {
    if (req.session?.user) return req.session.user;

    const token = req.cookies?.token;
    if (token) {
      try {
        const payload: any = this.authService.verifyJwt(token);
        const userId = payload.sub || payload.id;
        if (userId) {
          const user = await this.prisma.user.findUnique({ where: { id: userId } });
          if (user && req.session) {
            Object.assign(req.session, { user });
            req.session.save?.(() => {});
          }
          return user;
        }
      } catch {
        return null;
      }
    }
    return null;
  }

  @Post('register')
  async registerLocal(
    @Body() body: { name: string; email: string; password: string },
    @Res() res: Response,
  ) {
    const user = await this.authService.registerLocal(body);
    const token = this.authService.generateJwt({
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
    });
    res.cookie('token', token, {
      sameSite: 'lax',
      httpOnly: true,
      secure: false,
      path: '/',
    });
    return res.status(201).json(user);
  }
-
  @Post('login')
  async loginLocal(
    @Body() body: { email: string; password: string },
    @Req() req: any,
    @Res() res: Response,
  ) {
    const user = await this.authService.validateLocal(body.email, body.password);
    const token = this.authService.generateJwt({
      id: user.id,
      sub: user.id,
      email: user.email,
      name: user.name,
    });

    res.cookie('token', token, {
      sameSite: 'lax',
      httpOnly: true,
      secure: false,
      path: '/',
    });

    if (req && req?.session) {
      Object.assign(req.session, { user });
      await new Promise<void>((resolve) => req.session.save(() => resolve()));
    }

    return res.json({ token, user });
  }

  @Patch('update')
  async updateCredentials(
    @Req() req: any,
    @Body() body: { currentPassword?: string; newPassword?: string },
  ) {
    const sessionUser = req.session?.user;
    let userId = sessionUser?.id;
    if (!userId) {
      const token = req.cookies?.token || req.headers?.authorization?.split?.(' ')[1];
      if (!token) throw new UnauthorizedException('Not authenticated');
      const payload: any = this.authService.verifyJwt(token);
      userId = payload.sub || payload.id;
    }

    if (!userId) throw new UnauthorizedException('Not authenticated');

    if (!body.newPassword) throw new BadRequestException('newPassword required');

    const updated = await this.authService.changePassword(
      userId,
      body.currentPassword,
      body.newPassword,
    );

    const newToken = this.authService.generateJwt({
      id: updated.id,
      sub: updated.id,
      email: updated.email,
      name: updated.name,
    });

    (req.res as Response).cookie('token', newToken, {
      sameSite: 'lax',
      httpOnly: true,
      secure: false,
      path: '/',
    });

    if (req.session) {
      Object.assign(req.session, { user: updated });
      req.session.save?.(() => {});
    }

    return updated;
  }
}
