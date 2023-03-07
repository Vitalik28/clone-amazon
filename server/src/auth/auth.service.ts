import { faker } from '@faker-js/faker';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async register(dto: AuthDto) {
    const candidat = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (candidat) return new BadRequestException('Пользователь уже существует');

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: faker.name.firstName(),
        avatarPath: faker.image.avatar(),
        phone: faker.phone.number('+7 (###) ###-##-##'),
        password: await hash(dto.password),
      },
    });

    const tokens = this.generateToken(user.id);
    
    return { user: this.returnUserFields(user), ...tokens };
  }

  private generateToken(userId: number) {
    const data = { id: userId };

    const accessToken = this.jwt.sign(data, {
      expiresIn: '1h',
    });

    const refreshToken = this.jwt.sign(data, {
      expiresIn: '7d',
    });

    return { accessToken, refreshToken };
  }

  private returnUserFields(user: User) {
    return { id: user.id, email: user.email };
  }
}
