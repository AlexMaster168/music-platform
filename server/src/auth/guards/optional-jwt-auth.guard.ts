import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Мягкая авторизация: если токен есть и валиден — кладёт user в request,
 * если токена нет — пропускает запрос без ошибки (req.user = undefined).
 * Нужна для роутов вроде GET /tracks/:id, где для залогиненного показываем isLiked.
 */
@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
   canActivate(context: ExecutionContext) {
      return super.canActivate(context);
   }

   handleRequest(err: any, user: any) {
      // не бросаем ошибку при отсутствии пользователя
      return user ?? null;
   }
}
