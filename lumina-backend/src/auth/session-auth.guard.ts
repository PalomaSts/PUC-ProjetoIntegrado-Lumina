import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    if (!req || !req.cookies) {
      return false;
    }

    const { token } = req.cookies || {};

    if (!token) {
      if (req.session && req.session.user && req.session.user.id) {
        return true;
      }
      return false;
    }

    let payload: any;
    try {
      payload = this.authService.verifyJwt(token);
    } catch (err) {
      return false;
    }

    if (!payload) return false;

    const sessionUser = {
      id: payload.sub || payload.id,
      email: payload.email,
      name: payload.name,
      picture: payload.picture ?? '',
    };

    req.session.user = sessionUser;

    if (typeof req.session.save === 'function') {
      req.session.save((err: any) => {
        if (err) {
          console.error('session save error (SessionAuthGuard):', err);
        }
      });
    }

    return true;
  }
}
