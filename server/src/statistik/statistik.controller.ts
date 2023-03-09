import { Controller } from '@nestjs/common';
import { StatistikService } from './statistik.service';

@Controller('statistik')
export class StatistikController {
  constructor(private readonly statistikService: StatistikService) {}
}
