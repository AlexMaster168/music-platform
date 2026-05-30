import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthUser } from '../../common/decorators/current-user.decorator';

interface JwtPayload {
   sub: string;
   email: string;
   displayName: string;
   role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
   constructor(config: ConfigService) {
      super({
         jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
         ignoreExpiration: false,
         secretOrKey: config.get<string>('JWT_ACCESS_SECRET') as string,
      });
   }

   validate(payload: JwtPayload): AuthUser {
      return {
         userId: payload.sub,
         email: payload.email,
         displayName: payload.displayName,
         role: payload.role ?? 'user',
      };
   }
}
