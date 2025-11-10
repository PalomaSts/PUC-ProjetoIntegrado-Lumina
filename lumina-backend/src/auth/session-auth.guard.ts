import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Injectable()
export class SessionAuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();

    // Segurança: se não houver cookies ou session, negar
    if (!req || !req.cookies) {
      return false;
    }

    // tenta extrair token do cookie (se existir)
    const { token } = req.cookies || {};

    // se não houver token, tentar usar a sessão já existente
    if (!token) {
      // Se já tiver session.user plano, permitir
      if (req.session && req.session.user && req.session.user.id) {
        return true;
      }
      return false;
    }

    // Caso haja token, verifica e extrai o payload
    let payload: any;
    try {
      payload = this.authService.verifyJwt(token);
    } catch (err) {
      return false;
    }

    if (!payload) return false;

    // Normaliza o objeto a salvar na sessão (apenas campos necessários)
    const sessionUser = {
      id: payload.sub || payload.id,
      email: payload.email,
      name: payload.name,
      picture: payload.picture ?? '',
    };

    // salva direto o objeto plano — **NÃO** embrulhe em { user: sessionUser }
    req.session.user = sessionUser;

    // se seu store necessita, tenta salvar a sessão de forma síncrona
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
