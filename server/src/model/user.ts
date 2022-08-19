import { UserRole } from "../pkg/permission";

export enum Gender {
    unknow,
    male,
    female
}

export interface UserChangeInfo {
    username?: string;
    password?: string;
    email?: string;
    avatar?: string;
    signature?: string;
    gender?: Gender;
    role?: UserRole;
    message_alert?: number;
    message_system?: number;
    message_system_read?: number;
    message_other_read?: number;
    last_online?: number;
    blocked_time?: number;
    birthday?: number;
}

// 完整的用户信息
export interface UserInfo extends UserChangeInfo {
    username: string;
    password: string;
    email: string;
    uid: string;
    id?: number;
}

// 残缺的用户信息，用来判断用户是否存在或者获取用户等
export interface UserGetInfo {
    username?: string;
    email?: string;
    uid?: string;
    id?: number;
    role?: UserRole;
}

// export type UserRoles = 'normal' | 'admin' | 'topAdmin';

export interface UserRegister {
    username: string;
    password: string;
    email: string;
    code: string;
}

export interface UserLogin {
    email: string;
    password: string;
}

// export enum UserRolesNumber {
//     normal,
//     admin,
//     topAdmin
// }

// export enum UserRoles {
//     normal = 'normal',
//     admin = 'admin',
//     topAdmin = 'topAdmin'
// }