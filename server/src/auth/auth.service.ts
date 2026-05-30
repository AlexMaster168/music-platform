import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { UserService } from '../user/user.service';
import { UserDocument } from '../user/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
   constructor(
      private readonly users: UserService,
      private readonly jwt: JwtService,
      private readonly config: ConfigService
   ) {}

   async register(dto: RegisterDto) {
      const existing = await this.users.findByEmail(dto.email);
      if (existing) {
         throw new ConflictException('Пользователь с таким email уже существует');
      }
      const passwordHash = await bcrypt.hash(dto.password, 10);
      const user = await this.users.create({
         email: dto.email,
         passwordHash,
         displayName: dto.displayName,
      });
      return this.buildAuthResponse(user);
   }

   async login(dto: LoginDto) {
      const user = await this.users.findByEmail(dto.email);
      if (!user) {
         throw new UnauthorizedException('Неверный email или пароль');
      }
      const valid = await bcrypt.compare(dto.password, user.passwordHash);
      if (!valid) {
         throw new UnauthorizedException('Неверный email или пароль');
      }
      return this.buildAuthResponse(user);
   }

   async refresh(refreshToken: string) {
      try {
         const payload = await this.jwt.verifyAsync(refreshToken, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
         });
         const user = await this.users.findById(payload.sub);
         if (!user) throw new UnauthorizedException();
         return this.buildAuthResponse(user);
      } catch {
         throw new UnauthorizedException('Невалидный или просроченный refresh-токен');
      }
   }

   private async buildAuthResponse(user: UserDocument) {
      const payload = {
         sub: user._id.toString(),
         email: user.email,
         displayName: user.displayName,
         role: user.role,
      };
      const accessToken = await this.jwt.signAsync(payload, {
         secret: this.config.get<string>('JWT_ACCESS_SECRET'),
         expiresIn: (this.config.get<string>('JWT_ACCESS_TTL') ?? '15m') as any,
      });
      const refreshToken = await this.jwt.signAsync(payload, {
         secret: this.config.get<string>('JWT_REFRESH_SECRET'),
         expiresIn: (this.config.get<string>('JWT_REFRESH_TTL') ?? '30d') as any,
      });
      return { accessToken, refreshToken, user: user.toJSON() };
   }
}
