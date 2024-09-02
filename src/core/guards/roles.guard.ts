import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    console.log('context user', user);
    return user && user.role === 'admin';
  }
}

@Injectable()
export class UserOwnershipGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userIdInRequest =
      request.body.userId ||
      request.params.userId ||
      request.query.userId ||
      request.body.id ||
      request.params.id ||
      request.query.id;
    const emailInRequest =
      request.body.email || request.params.email || request.query.email;

    return (
      user && (user.id === userIdInRequest || user.email === emailInRequest)
    );
  }
}
