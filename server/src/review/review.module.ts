import { Module } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [ReviewController],
  providers: [ReviewService, PrismaService]
})
export class ReviewModule {}
