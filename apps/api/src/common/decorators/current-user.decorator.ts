import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface AuthenticatedUser {
  id: string;
  email: string;
  fullName: string;
  status: string;
  role: {
    id: string;
    code: string;
    name: string;
    isAdminPanel: boolean;
  };
  permissions: string[];
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUser | undefined;
    if (!user) return null;
    return data ? user[data] : user;
  },
);

