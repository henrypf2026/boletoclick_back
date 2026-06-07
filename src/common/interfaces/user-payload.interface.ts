import { Role } from '../enums/role.enum';

export class UserPayload {
  id!: string;
  email!: string;
  role!: Role;
}
