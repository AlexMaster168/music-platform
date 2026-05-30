import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthUser {
   userId: string;
   email: string;
   displayName: string;
   role: string;
}

/**
 * Достаёт пользователя (или его поле) из request, куда его положил JwtStrategy.
 * @example @CurrentUser() user: AuthUser
 * @example @CurrentUser('userId') userId: string
 */
export const CurrentUser = createParamDecorator((data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
   const request = ctx.switchToHttp().getRequest();
   const user: AuthUser = request.user;
   return data ? user?.[data] : user;
});
