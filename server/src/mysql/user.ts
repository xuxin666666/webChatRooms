import { GroupMemberRole } from '../pkg/permission';
import { UserGetInfo, UserInfo, UserChangeInfo } from './../model/user';
import { connPool, transaction, runInOrder } from './setup'

/**
 * 检查用户是否存在
 * @param userInfo 至少包含username或email
 */
export const ACheckUserExist = (userInfo: UserGetInfo) => new Promise((
    resolve: (exist: boolean) => void,
    reject
) => {
    let sql = `select count(*) from users where `
    let key: keyof UserGetInfo
    let selectArr = [], values = Object.values(userInfo)
    for(key in userInfo) {
        selectArr.push(`\`${key}\` = ?`)
    }
    sql += selectArr.join(' and ')

    connPool.execute(sql, values).then(([res]) => {
        // res[0]['count(*)'], 查询到的数量
        if ((res as any)[0]['count(*)']) resolve(true)
        else resolve(false)
    }).catch((err) => {
        console.logger('ACheckUserExist', err)
        resolve(false)
    })
})

/**
 * 创建用户
 *  ```
 *  {
        fieldCount: 0,
        affectedRows: 1,
        insertId: 2,
        info: '',
        serverStatus: 2,
        warningStatus: 0
    }
    ```
 */
export const ACreateUser = (userInfo: UserInfo) => new Promise((
    resolve,
    reject
) => {
    let key: keyof UserInfo
    let sql = 'insert into `users`('
    let labels = [], qm = [], values = Object.values(userInfo)

    for (key in userInfo) {
        if (userInfo[key] !== undefined && userInfo[key] !== null) {
            labels.push(`\`${key}\``)
            qm.push('?')
        }
    }
    sql += labels.join(',') + ') values(' + qm.join(',') + ')'

    // 添加用户和建表
    runInOrder(
        [
            `create Table ?? (
                \`id\` INT NOT NULL AUTO_INCREMENT,
                \`read\` TINYINT DEFAULT 1,
                \`group\` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
                PRIMARY KEY(\`id\`)
            ) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`,

            `create Table ?? (
                \`id\` INT NOT NULL AUTO_INCREMENT,
                \`message\` VARCHAR(100) NOT NULL collate utf8mb4_general_ci,
                \`create_time\` BIGINT(13) NOT NULL,
                PRIMARY KEY(\`id\`)
            ) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`,

            sql
        ],
        [
            [userInfo.uid + '_groups'],
            [userInfo.uid + '_messages'],
            values
        ]
    ).then(res => {
        resolve(res)
    }).catch(err => {
        console.logger('ACreateUser', err)
        reject(err)
    })
})

/**
 * 根据用户信息获取用户的全部信息
 * @param userInfo 用户的部分信息
 * @returns 单个用户的信息
 */
export const AGetUserInfo = (userInfo: UserGetInfo) => new Promise((
    resolve: (users: UserInfo) => void,
    reject
) => {
    // 拼接查询命令
    let key: keyof UserGetInfo

    let sql = 'select * from users where '
    let selectArr = [], values = Object.values(userInfo)

    for (key in userInfo) {
        if (userInfo[key] !== undefined && userInfo[key] !== null)
            selectArr.push(`\`${key}\` = ?`)
    }
    sql += selectArr.join(' and ')

    connPool.execute(sql, values).then(([users]) => {
        // 可能多个用户
        // [{uid, username, ...}, {...}, ...]
        resolve((users as UserInfo[])[0])
    }).catch(err => {
        console.logger('AGetUserByUID', err)
        reject(err)
    })
})

/**
 * 获取用户的某个群的未读消息的状态
 * 0: 未读，1: 已读
 */
export const AGetGroupReadStatus = (uid: string, gid: string) => new Promise((
    resolve: (read: number) => void,
    reject
) => {
    connPool.query(
        `select ?? from ?? where ??=?`,
        ['read', uid + '_groups', 'group', gid]
    ).then(([res]) => {
        // [{read: 0}]
        resolve((res as any)[0]['read'])
    }).catch(err => {
        console.logger('AGetGroupReadStatus', err)
        reject(err)
    })
})

export const AUserGetJoinedGroup = (uid: string) => new Promise((
    resolve: (gids: string[]) => void,
    reject
) => {
    connPool.query(
        `select ?? from ??`,
        ['group', uid + '_groups']
    ).then(([res]) => {
        // [{group: gid}, {group: gid}, ...]
        resolve((res as any).map((item: { group: string }) => item.group))
    }).catch(err => {
        console.logger('AUserGetJoinedGroup', err)
        reject(err)
    })
})

/**
 * 用户加入群聊
 * @param uid 
 * @param gid 
 * @returns 结果信息
 * ```
 * {
    fieldCount: 0,
    affectedRows: 0,
    insertId: 0,
    info: '',
    serverStatus: 2,
    warningStatus: 0
  }
 * ```
 */
export const AUserJoinGroup = (uid: string, gid: string, role: GroupMemberRole = 'normal') => new Promise((
    resolve,
    reject
) => {
    transaction(
        [
            `insert into ??(??) values(?)`,
            `insert into ??(??, ??) values(?, ?)`
        ],
        [
            [uid + '_groups', 'group', gid],
            [gid + '_members', 'member', 'role', uid, role]
        ]
    ).then(res => {
        resolve(res)
    }).catch(err => {
        console.logger('AUserJoinGroup', err)
        reject(err)
    })
})

/**
 * 用户退出群聊
 * ```
 * {
    fieldCount: 0,
    affectedRows: 0,
    insertId: 0,
    info: '',
    serverStatus: 2,
    warningStatus: 0
  }
 * ```
 */
export const AUserExitGroup = (uid: string, gid: string) => new Promise((
    resolve,
    reject
) => {
    transaction(
        [
            `delete from ?? where ??=?`,
            `deelte from ?? where ??=?`
        ],
        [
            [uid + '_groups', 'group', gid],
            [gid + '_members', 'member', uid]
        ]
    ).then(res => {
        resolve(res)
    }).catch(err => {
        console.logger('AUserExitGroup', err)
        reject(err)
    })
})

/**
 * 更改用户的某个群的未读消息的状态
 * ```
 * {
    fieldCount: 0,
    affectedRows: 0,
    insertId: 0,
    info: '',
    serverStatus: 2,
    warningStatus: 0
  }
 * ```
 */
export const AChangeGroupReadStatus = (uid: string, gid: string, read: number) => new Promise((
    resolve,
    reject
) => {
    connPool.query(
        `update ?? set ??=? where ??=?`,
        [uid + '_groups', 'read', read, 'group', gid]
    ).then(([res]) => {
        resolve(res)
    }).catch(err => {
        console.logger('AChangeGroupReadStatus', err)
        reject(err)
    })
})

/**
 * 更改用户的一些信息
 * ```
 * {
    fieldCount: 0,
    affectedRows: 0,
    insertId: 0,
    info: '',
    serverStatus: 2,
    warningStatus: 0
  }
 * ```
 */
export const AChangeUserInfo = (uid: string, info: UserChangeInfo) => new Promise((
    resolve,
    reject
) => {
    // 拼接修改命令
    let key: keyof UserChangeInfo
    let sql = 'update `users` set '
    let selectArr = [], values = Object.values(info)

    for (key in info) {
        if (info[key] !== undefined && info[key] !== null) {
            selectArr.push(`\`${key}\` = ?`)
        }
    }

    if (!selectArr.length) return resolve({})

    sql += selectArr.join(', ')
    sql += ` where \`uid\`='${uid}'`

    connPool.execute(
        sql,
        values
    ).then(([res]) => {
        resolve(res)
    }).catch(err => {
        console.logger('AChangeUserInfo', err)
        reject(err)
    })
})

/**
 * 
 * @param start 倒序，从0开始
 * @param nums 选取消息的数量
 * @returns 
 */
export const AGetSystemMessage = (start: number | string, nums: number = 10) => new Promise((
    resolve: (
        messages: {
            message: string,
            create_time: number,
            id: number
        }[]
    ) => void,
    reject
) => {
    connPool.query(
        'select `message`, `create_time` from `system_messages` order by `create_time` desc limit ?, ?',
        [start, nums]
    ).then(([res]) => {
        resolve((<any>res).reverse())
    }).catch(err => {
        console.logger('AGetSystemMessage', err)
        resolve([])
    })
})

/**
 * 获取用户个人收到的消息
 * @param uid
 * @param start 倒序，从0开始
 * @param nums 选取消息的数量
 * @returns 
 */
export const AGetOtherMessage = (uid: string, start: number | string, nums: number = 10) => new Promise((
    resolve: (
        messages: {
            message: string,
            create_time: number,
        }[]
    ) => void,
    reject
) => {
    connPool.query(
        'select `message`, `create_time` from ?? order by `create_time` desc limit ?, ?',
        [uid + '_messages', start, nums]
    ).then(([res]) => {
        resolve((<any>res).reverse())
    }).catch(err => {
        console.logger('AGetOtherMessage', err)
        resolve([])
    })
})

const options = ['block', 'role']
export const AGetAndFilterUsers = (conditions: {[key: string]: string}, page: number, pageSize: number) => new Promise<UserInfo[]>((resolve, reject) => {
    let sql = 'select * from users', opts: string[] = []
    options.forEach(item => {
        if(conditions[item]) opts.push(conditions[item])
    })

    if(opts.length) {
        sql += ' where ' + opts.join(' and ')
    }
    sql += ' ' + conditions.order + ' limit ?,?'

    connPool.execute(
        sql,
        [page * pageSize, pageSize]
    ).then(([users]) => {
        resolve((users as UserInfo[]))
    }).catch(err => {
        console.logger('AGetAndFilterUsers: ', err)
        reject(err)
    })
})

export const AGetUsersNum = (conditions: {[key: string]: string}) => new Promise<number>((resolve, reject) => {
    let sql = 'select count(*) from users', opts: string[] = []
    options.forEach(item => {
        if(conditions[item]) opts.push(conditions[item])
    })

    if(opts.length) {
        sql += ' where ' + opts.join(' and ')
    }

    connPool.execute(sql).then(([res]) => {
        // res[0]['count(*)'], 查询到的数量
        resolve((res as any)[0]['count(*)'])
    }).catch((err) => {
        console.logger('AGetUsersNum', err)
        reject(err)
    })
})
