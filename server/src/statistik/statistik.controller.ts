import { Controller, Get } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { StatistikService } from './statistik.service';

@Controller('statistik')
export class StatistikController {
  constructor(private readonly statistikService: StatistikService) {}

  @Get('main')
  @Auth()
  async getMainStatistics(@CurrentUser('id') id: number) {
    return await this.statistikService.getMain(id);
  }
}
