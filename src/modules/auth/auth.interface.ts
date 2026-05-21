export const UserRoleEnum = {
  contributor: "contributor",
  maintainer: "maintainer",
} as const;

export type UserRole = (typeof UserRoleEnum)[keyof typeof UserRoleEnum];

export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface ISignup {
  name: string;
  email: string;
  password: string;
  role?: UserRole | undefined;
}

export interface ILogin {
  email: string;
  password: string;
}
