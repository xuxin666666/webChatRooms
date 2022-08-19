import { GroupMemberRole } from "../pkg/permission";

export interface GroupGetGroups {
    gid?: string;
    id?: number;
    owner?: string;
    name?: string;
}

interface GroupInitInfo {
    id: number;
    max_num: number;    // 管理员最大人数
    gid: string;
    name: string;
    description: string;
    owner: string;
    avatar: string;
}

export interface GroupSqlInfo extends GroupInitInfo {
    admins: string;
}

export interface GroupInfo extends GroupInitInfo {
    admins: string[];
    read?: boolean;
}

export interface GroupChangeInfo {
    name?: string;
    description?: string;
    avatar?: string;
}

export interface GroupCreate {
    gid: string;
    name: string;
    description: string;
    owner: string;
    avatar?: string;
}

export interface GroupMember {
    role?: GroupMemberRole;
    member?: string;
}

