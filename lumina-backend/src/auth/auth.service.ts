import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_KEY,
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }

  verifyJwt(token) {
    return this.jwtService.verify(token, {
      secret: process.env.JWT_KEY,
    });
  }

  async signIn(profile) {
    if (!profile) {
      throw new BadRequestException('Unauthenticated');
    }

    const { name, emails, photos } = profile;

    const email = emails[0].value;
    const picture = photos.length > 0 ? photos[0].value : '';
    const fullName = name.givenName + ' ' + name.familyName;

    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.registerUserFromOAuth(profile);
    }

    return {
      token: this.generateJwt({
        id: user.id,
        sub: user.id,
        email: user.email,
        name: fullName,
        picture: picture,
      }),
      user,
    };
  }

  // --- novo: registro local
  async registerLocal(data: { name: string; email: string; password: string }) {
    const { name, email, password } = data;
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await this.prisma.user.create({
        data: {
          name,
          email,
          password: hashed,
          picture: '',
        },
      });
      return user;
    } catch (err) {
      throw new InternalServerErrorException('Erro ao criar usuário');
    }
  }

  // --- novo: validação local (login)
  async validateLocal(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Credenciais inválidas');
    }
    return user;
  }

  // --- novo: alteração de credenciais (trocar senha)
  async changePassword(userId: string, currentPassword: string | undefined, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuário não encontrado');

    // se currentPassword fornecido, valida; se não (admin flow) você pode permitir
    if (currentPassword) {
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) throw new UnauthorizedException('Senha atual inválida');
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    });
    return updated;
  }

  // função que existia (ajustada nome) para registro via OAuth
  async registerUserFromOAuth(user: any) {
    try {
      const { name, emails, photos } = user;
      const email = emails[0].value;
      const picture = photos.length > 0 ? photos[0].value : '';
      const fullName = name.givenName + ' ' + name.familyName;

      // gerar senha aleatória curta pra preencher campo (não usada)
      const randomPassword = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPassword, 10);

      const record = await this.prisma.user.create({
        data: {
          email,
          name: fullName,
          password: hashed,
          picture: picture,
        },
      });

      return record;
    } catch (err) {
      throw new InternalServerErrorException();
    }
  }
}
