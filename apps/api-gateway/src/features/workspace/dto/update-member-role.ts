import { MemberRole } from '@devcollab/common/interfaces/member.interface';
import { IsIn } from 'class-validator';

export class UpdateMemberRoleDto {
  @IsIn([MemberRole.ADMIN, MemberRole.MEMBER, MemberRole.OWNER])
  role!: MemberRole;
}
