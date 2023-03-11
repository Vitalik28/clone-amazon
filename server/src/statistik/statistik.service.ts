import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class StatistikService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService,
  ) {}

  async getMain(userId: number) {
    const user = await this.userService.byId(userId, {
      orders: {
        select: { items: true },
      },
    });

    return user.orders;
    // return [
    //   { name: 'Orders', value: user.orders.length },
    //   { name: 'Reviews', value: user.orders.length },
    //   { name: 'Fovorites', value: user.orders.length },
    //   { name: '', value: user.orders.length },
    // ];
  }
}
