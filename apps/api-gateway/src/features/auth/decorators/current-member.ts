// common/decorators/current-member.decorator.ts
import { Member } from '@devcollab/common/interfaces/member.interface';
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentMember = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Member => {
    const request = ctx.switchToHttp().getRequest();
    return request.member;
  },
);
