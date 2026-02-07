import { Module } from '@nestjs/common';
import { AdminController } from './admin/admin.controller';
import { AuthGuard } from './auth/auth.guard';
import { InternalAuthGuard } from './auth/internal-auth.guard';
import { PrismaService } from './prisma/prisma.service';
import { PublicController } from './public/public.controller';
import { InternalController } from './internal/internal.controller';

@Module({
  controllers: [PublicController, AdminController, InternalController],
  providers: [PrismaService, AuthGuard, InternalAuthGuard]
})
export class AppModule {}
