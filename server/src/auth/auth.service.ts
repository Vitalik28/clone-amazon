import { faker } from '@faker-js/faker';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '@prisma/client';
import { hash, verify } from 'argon2';
import { PrismaService } from 'src/prisma.service';
import { AuthDto } from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

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

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    
    const tokens = this.generateToken(user.id);

    return { user: this.returnUserFields(user), ...tokens };
  }

  async getNewToken(refreshToken: string) {
    const result = await this.jwt.verifyAsync(refreshToken);

    if (!result) throw new UnauthorizedException('Не валидный токен');

    const user = await this.prisma.user.findUnique({
      where: { id: result.id },
    });

    const tokens = await this.generateToken(user.id);

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

  private async validateUser(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) throw new NotFoundException('Пользователь не найден');

    const isValid = await verify(user.password, dto.password);

    if (!isValid) throw new UnauthorizedException('Пароль не верен');

    return user;
  }
}
