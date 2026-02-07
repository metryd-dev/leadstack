import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    const devBypass = process.env.AUTH_DEV_BYPASS === 'true';
    const token = request.headers.authorization?.replace('Bearer ', '');

    if (devBypass && token === process.env.DEV_ADMIN_TOKEN) {
      return true;
    }

    throw new UnauthorizedException('Invalid admin token');
  }
}
