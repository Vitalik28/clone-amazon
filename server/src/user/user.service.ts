import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { UserDto } from './user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async byId(id: number, selectObject: Prisma.UserSelect = {}) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatarPath: true,
        password: false,
        phone: true,
        favorites: {
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            slug: true,
          },
        },
        ...selectObject,
      },
    });

    if (!user) throw new Error('Пользователь не найден');

    return user;
  }

  async updateProfile(id: number, dto: UserDto) {
    const isSameUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (isSameUser && id !== isSameUser.id)
      throw new BadRequestException('Email уже используеться');

    const user = await this.byId(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        name: dto.email,
        avatarPath: dto.avatarPath,
        phone: dto.phone,
        password: dto.password ? await hash(dto.password) : user.password,
      },
    });
  }

  async toggleFavorite(userId: number, productId: string) {
    const user = await this.byId(userId);
    if (!user) {
      throw new NotFoundException('Пользователь не найден');
    }

    const isExist = user.favorites.some(
      (favorite) => favorite.id === +productId,
    );

    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        favorites: {
          [isExist ? 'disconnect' : 'connect']: {
            id: productId,
          },
        },
      },
    });
    return 'Success';
  }
}
