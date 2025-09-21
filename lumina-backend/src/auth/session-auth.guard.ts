import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const { token } = request.cookies;

    try {
      const payload = this.authService.verifyJwt(token);
      request.session = {
        user: payload,
      };
      return true;
    } catch (error) {
      return false;
    }
  }
}
