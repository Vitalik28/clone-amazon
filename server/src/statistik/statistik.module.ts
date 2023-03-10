import { Module } from '@nestjs/common';
import { StatistikService } from './statistik.service';
import { StatistikController } from './statistik.controller';
import { PrismaService } from 'src/prisma.service';

@Module({
  controllers: [StatistikController],
  providers: [StatistikService, PrismaService],
})
export class StatistikModule {}
