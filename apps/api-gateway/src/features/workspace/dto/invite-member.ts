import { IsEmail, IsIn } from 'class-validator';
import { MemberRole } from '@devcollab/common/interfaces/member.interface';

export class InviteMemberDto {
  @IsEmail()
  email!: string;
  @IsIn([MemberRole.ADMIN, MemberRole.MEMBER])
  role!: MemberRole;
}
