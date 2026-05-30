import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Требует валидный access-токен (Bearer). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
