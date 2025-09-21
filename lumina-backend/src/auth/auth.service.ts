import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private prisma: PrismaService,
  ) {}

  generateJwt(payload) {
    return this.jwtService.sign(payload, {
      secret: process.env.JWT_KEY,
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
      user = await this.registerUser(profile);
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

  async registerUser(user: any) {
    try {
      const { name, emails, photos } = user;

      const email = emails[0].value;
      const picture = photos.length > 0 ? photos[0].value : '';
      const fullName = name.givenName + ' ' + name.familyName;

      const randomPassword = Math.random().toString(36).slice(-8);

      user = await this.prisma.user.create({
        data: {
          email,
          name: fullName,
          password: randomPassword,
          picture: picture,
        },
      });

      return user;
    } catch {
      throw new InternalServerErrorException();
    }
  }
}
