import { Module } from '@nestjs/common';
import { StatistikService } from './statistik.service';
import { StatistikController } from './statistik.controller';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Module({
  controllers: [StatistikController],
  providers: [StatistikService, PrismaService, UserService],
})
export class StatistikModule {}
