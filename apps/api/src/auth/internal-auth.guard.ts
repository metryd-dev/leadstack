import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class InternalAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ headers: Record<string, string | undefined> }>();
    if (request.headers['x-internal-token'] === process.env.INTERNAL_API_TOKEN) {
      return true;
    }

    throw new UnauthorizedException('Invalid internal token');
  }
}
