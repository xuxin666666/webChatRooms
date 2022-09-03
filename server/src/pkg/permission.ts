import mysql from "../mysql"

export type UserRole = 'topAdmin' | 'seniorAdmin' | 'admin' | 'normal'
export type GroupMemberRole = 'owner' | 'admin' | 'normal'

export enum UserRoles {
    topAdmn = 'topAdmin',
    seniorAdmin = 'seniorAdmin',
    admin = 'admin',
    normal = 'normal'
}
export enum GroupMemberRoles {
    owner = 'owner',
    admin = 'admin',
    normal = 'normal'
}

const USER_DELETE = 1,
    USER_SET_BLOCK = 2,
    USER_SET_ADMIN = 3,
    USER_SET_SENIOR_ADMIN = 4,
    USER_VIEW_USERS = 5,
    USER_DELETE_AVATAR = 6,
    GROUP_DELETE = 100,
    GROUP_SET_OWNER = 101,
    GROUP_SET_ADMIN = 102,
    GROUP_KICK_MEMBER = 103,
    GROUP_SET_INFO = 104,
    GROUP_DELETE_AVATAR = 105


interface Permissions {
    LEVEL: number
    USER_DELETE?: number
    USER_SET_BLOCK?: number
    USER_SET_ADMIN?: number
    USER_SET_SENIOR_ADMIN?: number
    USER_VIEW_USERS?: number
    USER_DELETE_AVATAR?: number
    GROUP_DELETE?: number
    GROUP_SET_OWNER?: number
    GROUP_SET_ADMIN?: number
    GROUP_KICK_MEMBER?: number
    GROUP_SET_INFO?: number
    GROUP_DELETE_AVATAR?: number
}


const User: {
    [T in UserRole]: Permissions
} = {
    topAdmin: {
        LEVEL: 4,
        USER_DELETE, USER_SET_BLOCK, USER_SET_ADMIN, USER_SET_SENIOR_ADMIN, GROUP_DELETE, USER_VIEW_USERS, USER_DELETE_AVATAR, GROUP_DELETE_AVATAR
    },
    seniorAdmin: {
        LEVEL: 3,
        USER_DELETE, USER_SET_BLOCK, USER_SET_ADMIN, GROUP_DELETE, USER_VIEW_USERS, USER_DELETE_AVATAR, GROUP_DELETE_AVATAR
    },
    admin: {
        LEVEL: 2,
        USER_SET_BLOCK, USER_VIEW_USERS, USER_DELETE_AVATAR, GROUP_DELETE_AVATAR
    },
    normal: {
        LEVEL: 1
    },
}
const GROUP: {
    [T in GroupMemberRole]: Permissions
} = {
    owner: {
        LEVEL: 3,
        GROUP_DELETE, GROUP_SET_OWNER, GROUP_SET_ADMIN, GROUP_KICK_MEMBER, GROUP_SET_INFO, GROUP_DELETE_AVATAR
    },
    admin: {
        LEVEL: 2,
        GROUP_KICK_MEMBER, GROUP_SET_INFO
    },
    normal: {
        LEVEL: 1
    }
}

const PERMISSION = {
    getUserRole(uid: string | number) {
        let prop: any
        if(typeof uid === 'string') prop = {uid}
        else if(typeof uid === 'number') prop = {id: uid}

        return new Promise<UserRole>((resolve, reject) => {
            mysql.AGetUserInfo(prop).then((userInfo) => {
                resolve(userInfo.role!)
            }).catch(err => {
                console.logger('PERMISSION.getUserRole() failed, uid/id:', uid, ', Error:', err)
                reject(err)
            })
        })
    },
    getGroupRole(gid: string, uid: string) {
        return new Promise<GroupMemberRole>((resolve, reject) => {
            mysql.GGetJoinedMembers(gid).then((member) => {
                let res = member.filter(item => item.member === uid)
                resolve(res[0].role)
            }).catch(err => {
                console.logger('PERMISSION.getGroupRole() failed, gid:', gid, ', Error:', err)
                reject(err)
            })
        })
    },
    async getUserPermissionsByID(user: string | number, target?: string | number, limitRole?: UserRole, equal?: boolean) {
        try {
            let role = await this.getUserRole(user)
            if(target) {
                let targetRole = await this.getUserRole(target)
                let permissions = this.getUserPermissions(role, targetRole, limitRole, equal)
                return Promise.resolve(permissions)
            } else {
                let permissions = this.getUserPermissions(role, undefined, limitRole, equal)
                return Promise.resolve(permissions)
            }
        } catch(err) {
            console.logger('PERMISSION.getUserPermissionsByID() failed, user:', user, 'target:', target, ', Error:', err)
            return Promise.reject(err)
        }
    },
    async getGroupPermissionsByID(group: string, user: string, target?: string, limitRole?: GroupMemberRole, equal?: boolean) {
        try {
            let role = await this.getGroupRole(group, user)
            if(target) {
                let targetRole = await this.getGroupRole(group, target)
                let permissions = this.getGroupPermissions(role, targetRole, limitRole, equal)
                return Promise.resolve(permissions)
            } else {
                let permissions = this.getGroupPermissions(role, undefined, limitRole, equal)
                return Promise.resolve(permissions)
            }
        } catch(err) {
            console.logger('PERMISSION.getGroupPermissionsByID() failed, user:', user, 'target:', target, ', Error:', err)
            return Promise.reject(err)
        }
    },
    getUserPermissions(role: UserRole, target?: UserRole, limitRole?: UserRole, equal?: boolean) {
        if (target && User[target].LEVEL >= User[role].LEVEL) {
            return {LEVEL: 1}
        }
        if (limitRole && (
            (equal && (User[limitRole].LEVEL >= User[limitRole].LEVEL)) ||
            (!equal && User[limitRole].LEVEL > User[limitRole].LEVEL)
        )) {
            return {LEVEL: 1}
        }
        return User[role]
    },
    getGroupPermissions(role: GroupMemberRole, target?: GroupMemberRole, limitRole?: GroupMemberRole, equal?: boolean) {
        if (target && GROUP[target].LEVEL >= GROUP[role].LEVEL) {
            return {LEVEL: 1}
        }
        if (limitRole && (
            (equal && (GROUP[limitRole].LEVEL >= GROUP[limitRole].LEVEL)) ||
            (!equal && (GROUP[limitRole].LEVEL > GROUP[limitRole].LEVEL))
        )) {
            return {LEVEL: 1}
        }
        return GROUP[role]
    },
    checkUserRoleParams(role: string) {
        if(Object.keys(UserRoles).includes(role)) {
            return true
        }
        return false
    },
    checkGroupRoleParams(role: string) {
        if(Object.keys(GroupMemberRoles).includes(role)) {
            return true
        }
        return false
    },
    async canSetUserRole(user: string, target: string, targetRole: UserRole) {
        try {
            let able: number | undefined | boolean
            if(targetRole === UserRoles.topAdmn) {
                able = false
            } else if(targetRole === UserRoles.seniorAdmin) {
                able = (await this.getUserPermissionsByID(user, target)).USER_SET_SENIOR_ADMIN
            } else if(targetRole === UserRoles.admin) {
                able = (await this.getUserPermissionsByID(user, target)).USER_SET_ADMIN
            } else {
                able = (await this.getUserPermissionsByID(user, target)).USER_SET_ADMIN
            }
            return Boolean(able)
        } catch(err) {
            console.logger('PERMISSION.canSetUserRole() failed, user:', user, ', target:', target, ', targetRole', targetRole, ', Error:', err)
            return Promise.reject(err)
        }
    },
    async canSetGroupRole(user: string, target: string, targetRole: GroupMemberRole) {
        try {
            let able: number | undefined | boolean
            if(targetRole === GroupMemberRoles.owner) {
                able = (await this.getGroupPermissionsByID(user, target)).GROUP_SET_OWNER
            } else if(targetRole === GroupMemberRoles.admin) {
                able = (await this.getGroupPermissionsByID(user, target)).GROUP_SET_ADMIN
            } else {
                able = (await this.getGroupPermissionsByID(user, target)).GROUP_SET_ADMIN
            }
            return Boolean(able)
        } catch(err) {
            console.logger('PERMISSION.canSetGroupRole() failed, user:', user, ', target:', target, ', targetRole', targetRole, ', Error:', err)
            return Promise.reject(err)
        }
    }
}

export default PERMISSION
