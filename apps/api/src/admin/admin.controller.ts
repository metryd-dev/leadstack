import { Body, Controller, Get, Param, Patch, Req, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsBoolean, IsIn } from 'class-validator';
import { AuthGuard } from '../auth/auth.guard';
import { PrismaService } from '../prisma/prisma.service';

class UpdateLeadStatusDto {
  @IsIn(['NEW', 'CONTACTED', 'CLOSED'])
  status!: 'NEW' | 'CONTACTED' | 'CLOSED';
}

class PublishReviewDto {
  @IsBoolean()
  publish!: boolean;
}

@ApiTags('admin')
@UseGuards(AuthGuard)
@Controller('admin')
export class AdminController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('leads')
  async getLeads() {
    return this.prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Patch('leads/:id/status')
  async updateLeadStatus(@Param('id') id: string, @Body() dto: UpdateLeadStatusDto) {
    return this.prisma.lead.update({ where: { id }, data: { status: dto.status } });
  }

  @Get('reviews')
  async getReviews() {
    return this.prisma.review.findMany({ orderBy: { createdAt: 'desc' } });
  }

  @Patch('reviews/:id/publish')
  async publishReview(@Param('id') id: string, @Body() dto: PublishReviewDto) {
    return this.prisma.review.update({ where: { id }, data: { published: dto.publish } });
  }

  @Get('me')
  me(@Req() req: { headers: Record<string, string | undefined> }) {
    return { role: 'admin', token: req.headers.authorization?.replace('Bearer ', '') ?? null };
  }
}
