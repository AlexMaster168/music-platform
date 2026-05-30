import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { AuthUser } from '../../common/decorators/current-user.decorator';

/** Проверяет роль пользователя (берётся из JWT). Используется ПОСЛЕ JwtAuthGuard. */
@Injectable()
export class RolesGuard implements CanActivate {
   constructor(private readonly reflector: Reflector) {}

   canActivate(context: ExecutionContext): boolean {
      const required = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
         context.getHandler(),
         context.getClass(),
      ]);
      if (!required || required.length === 0) return true;

      const user: AuthUser = context.switchToHttp().getRequest().user;
      if (!user || !required.includes(user.role)) {
         throw new ForbiddenException('Недостаточно прав');
      }
      return true;
   }
}
