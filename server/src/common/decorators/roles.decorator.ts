import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Ограничивает доступ к роуту указанными ролями. @example @Roles('admin') */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
