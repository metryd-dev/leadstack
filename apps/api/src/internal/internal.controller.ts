import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { InternalAuthGuard } from '../auth/internal-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

class RegisterChatDto {
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @IsString()
  @IsOptional()
  title?: string;
}

class SetEnabledDto {
  @IsString()
  @IsNotEmpty()
  chatId!: string;

  @IsBoolean()
  enabled!: boolean;
}

@ApiTags('internal')
@UseGuards(InternalAuthGuard)
@Controller('internal')
export class InternalController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('telegram/chats')
  async chats() {
    return this.prisma.telegramChat.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Post('telegram/register')
  async register(@Body() dto: RegisterChatDto) {
    return this.prisma.telegramChat.upsert({
      where: { chatId: dto.chatId },
      create: { chatId: dto.chatId, title: dto.title, enabled: true },
      update: { title: dto.title ?? null, enabled: true }
    });
  }

  @Post('telegram/set-enabled')
  async setEnabled(@Body() dto: SetEnabledDto) {
    return this.prisma.telegramChat.update({ where: { chatId: dto.chatId }, data: { enabled: dto.enabled } });
  }

  @Get('leads/recent')
  async recentLeads() {
    return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 20 });
  }

  @Get('leads/:id')
  async leadById(@Param('id') id: string) {
    return this.prisma.lead.findUnique({ where: { id } });
  }

  @Patch('leads/:id/status/:status')
  async updateStatus(@Param('id') id: string, @Param('status') status: 'NEW' | 'CONTACTED' | 'CLOSED') {
    return this.prisma.lead.update({ where: { id }, data: { status } });
  }
}
