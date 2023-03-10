import { Body, Controller, Get, HttpCode, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { CurrentUser } from 'src/auth/decorators/user.decorator';
import { ReviewDto } from './review.dto';
import { ReviewService } from './review.service';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  async getAll() {
    return await this.reviewService.getAll();
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Auth()
  @Post('leave/:productId')
  async leaveReview(
    @CurrentUser('id') userId: number,
    @Body() dto: ReviewDto,
    @Param('productId') productId: string,
  ) {
    return await this.reviewService.create(userId, dto, +productId);
  }
}
