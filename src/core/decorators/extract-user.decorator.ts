import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface JwtUser {
  email: string;
  id: string;
}

export const ExtractUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as JwtUser;
  },
);
