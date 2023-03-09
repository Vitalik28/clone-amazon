import { Module } from '@nestjs/common';
import { StatistikService } from './statistik.service';
import { StatistikController } from './statistik.controller';

@Module({
  controllers: [StatistikController],
  providers: [StatistikService]
})
export class StatistikModule {}
