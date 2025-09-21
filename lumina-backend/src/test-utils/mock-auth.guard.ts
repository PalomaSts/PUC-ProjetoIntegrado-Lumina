import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    request.session = {
      user: {
        id: 'test-user',
        email: 'test@example.com',
        name: 'Test User',
      },
    };
    return true;
  }
}
