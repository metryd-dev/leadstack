import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Max, Min } from 'class-validator';
import { PrismaService } from '../prisma/prisma.service';

class CreateLeadDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsOptional()
  message?: string;
}

class CreateReviewDto {
  @IsString()
  @IsNotEmpty()
  author!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;
}

@ApiTags('public')
@Controller('public')
export class PublicController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('leads')
  async createLead(@Body() dto: CreateLeadDto) {
    return this.prisma.$transaction(async (tx: any) => {
      const lead = await tx.lead.create({
        data: {
          name: dto.name,
          phone: dto.phone,
          message: dto.message,
          status: 'NEW'
        }
      });

      await tx.outboxEvent.create({
        data: {
          topic: 'lead.created',
          payload: JSON.stringify({ leadId: lead.id, name: lead.name, phone: lead.phone, message: lead.message }),
          leadId: lead.id
        }
      });

      return lead;
    });
  }

  @Get('reviews')
  async getReviews(@Query('published') published?: string) {
    const where = published === '1' ? { published: true } : {};
    return this.prisma.review.findMany({ where, orderBy: { createdAt: 'desc' } });
  }

  @Post('reviews')
  async createReview(@Body() dto: CreateReviewDto) {
    return this.prisma.$transaction(async (tx: any) => {
      const review = await tx.review.create({
        data: {
          author: dto.author,
          content: dto.content,
          rating: dto.rating
        }
      });

      await tx.outboxEvent.create({
        data: {
          topic: 'review.created',
          payload: JSON.stringify({ reviewId: review.id, author: review.author, content: review.content, rating: review.rating }),
          reviewId: review.id
        }
      });

      return review;
    });
  }
}
