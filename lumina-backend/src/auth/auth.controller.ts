import {
  Body,
  Controller,
  Get,
  Patch,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
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
  async googleAuthRedirect(@Req() req, @Res() res: Response) {
    const { token, user } = await this.authService.signIn(req.user);

    res.cookie('token', token, {
      sameSite: 'lax',
      httpOnly: true,
      secure: false,
    });

    return res.json(user);
  }

  @Get('me')
  getMe(@Req() req) {
    return req.session.user;
  }

  @Patch('me')
  async updateMe(
    @Req() req,
    @Body() body: { name?: string; picture?: string },
  ) {
    const user = req.session.user;
    if (!user) {
      throw new UnauthorizedException('Usuário não autenticado');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: user.id },
      data: {
        name: body.name ?? undefined,
        picture: body.picture ?? undefined,
      },
    });

    // Atualiza também a sessão
    req.session.user = updatedUser;

    return updatedUser;
  }
}
