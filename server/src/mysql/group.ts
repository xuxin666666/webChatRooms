import { connPool, transaction, runInOrder } from './setup'
import { AUserExitGroup, AUserJoinGroup } from './user'
import { GroupMemberRole } from '../pkg/permission'
import { GroupGetGroups, GroupSqlInfo, GroupChangeInfo, GroupCreate } from '../model/group'

/**
 * 创建群聊
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
const GCreateGroup = (info: GroupCreate) => new Promise((
    resolve: (groupID: string) => void,
    reject
) => {
    let key: keyof GroupCreate
    let sql = 'insert into `groups`('
    let labels = [], qm = [], values = Object.values(info)

    for (key in info) {
        if (info[key] !== undefined && info[key] !== null) {
            labels.push(`\`${key}\``)
            qm.push('?')
        }
    }
    sql += labels.join(',') + ') values(' + qm.join(',') + ')'

    let gid = info.gid
    runInOrder(
        [
            `create Table ?? (
               \`id\` INT NOT NULL AUTO_INCREMENT,
               \`member\` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
               \`role\` VARCHAR(50) DEFAULT 'normal' collate utf8mb4_general_ci COMMENT 'normal, admin',
               PRIMARY KEY(\`id\`)
            ) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`,

            `create Table ?? (
               \`id\` INT NOT NULL AUTO_INCREMENT,
               \`text\` VARCHAR(1000) NOT NULL collate utf8mb4_general_ci,
               \`publisher\` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
               \`type\` VARCHAR(10) NOT NULL collate utf8mb4_general_ci COMMENT 'text, image',
               \`create_time\` BIGINT(13) NOT NULL,
               PRIMARY KEY(\`id\`)
            ) engine = InnoDB DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`,

            sql
        ],
        [
            [gid + '_members'],
            [gid + '_contents'],
            values
        ]
    ).then(res => {
        // console.log(res)
        resolve(res[2][0].insertId)
    }).catch(err => {
        console.logger('GCreateGroup', err)
        reject(err)
    })
})

/**
 * 群添加消息
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
const GAddMessage = (gid: string, message: string, type: 'image' | 'text', uid: string) => new Promise((
    resolve: (create_time: number) => void,
    reject
) => {
    let timestamp = new Date().getTime()
    connPool.query(
        'insert into ??(`text`, `create_time`, `publisher`, `type`) values(?,?,?,?)',
        [gid + '_contents', message, timestamp, uid, type]
    ).then(() => {
        resolve(timestamp)
    }).catch(err => {
        console.logger('GAddMessage', err)
        reject(err)
    })
})

/**
 * 从群里选出消息，倒序选择正序输出
 * @param gid 
 * @param last_timestamp 消息的时间戳，为`-1`则表示从最新的消息开始
 * @param nums 往前找多少条数据
 * @returns 正序返回数据
 */
const GSelectMessages = (gid: string, nums: string | number, last_timestamp: number = -1) => new Promise((
    resolve: (
        messages: {
            text: string,
            type: string,
            publisher?: string,
            create_time: number;
            [key: string]: any
        }[]
    ) => void,
    reject
) => {
    if (last_timestamp === -1) {
        last_timestamp = new Date().getTime()
    }
    connPool.query(
        'select `text`, `publisher`, `create_time`, `type` from ?? where `create_time` <= ? order by `create_time` desc limit ?',
        [gid + '_contents', last_timestamp, Number(nums)]
    ).then(([res]) => {
        resolve((<any>res).reverse())
    }).catch(err => {
        console.logger('GSelectMessages', err)
        resolve([])
    })
})

/**
 * 解散群
 * @param {string} gid 
 * @returns 
 */
const GDeleteGroup = (gid: string) => new Promise((
    resolve,
    reject
) => {
    // 找出该群中的所有成员
    connPool.query(
        'select `member` from ??',
        [gid + '_members']
    ).then(([members]) => {
        // 删除每个成员中所加入的该群
        let sqls = (members as any[]).map(() => {
            return 'delete from ?? where `group`=?'
        })
        let params = (members as any[]).map(item => {
            return [item.member + '_groups', gid]
        })

        // 执行操作
        return transaction(
            [
                'delete from `groups` where `gid`=?',
                'drop table ??',
                'drop table ??',
                ...sqls
            ],
            [
                [gid],
                [gid + '_members'],
                [gid + '_contents'],
                ...params
            ]
        )
    }).then(res => {
        resolve(res)
    }).catch(err => {
        console.logger('GDeleteGroup', err)
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
const GRemoveMember = AUserExitGroup

/**
 * 用户加入群聊
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
const GAddMember = AUserJoinGroup

const GGetGroupInfo = (conditions: GroupGetGroups) => new Promise<GroupSqlInfo[]>((
    resolve,
    reject
) => {
    // 拼接查询命令
    let key: keyof GroupGetGroups

    let sql = 'select * from `groups` where '
    let selectArr = [], values = Object.values(conditions)

    for (key in conditions) {
        if (conditions[key] !== undefined && conditions[key] !== null)
            selectArr.push(`\`${key}\` = ?`)
    }
    sql += selectArr.join(' and ')

    connPool.execute(sql, values).then(([groups]) => {
        resolve((groups as GroupSqlInfo[]))
    }).catch(err => {
        console.logger('GGetGroup', err)
        reject(err)
    })
})

const GChangeMemberRole = (uid: string, gid: string, role: GroupMemberRole = 'admin') => new Promise((
    resolve: (value: void) => void,
    reject
) => {
    // connPool.query(
    //     'select admins from `groups` where gid = ?',
    //     [gid]
    // ).then(([res]) => {
    //     let admins = ((res as any)[0].admins as string).split(',')
    //     if (admins.length >= 100) {
    //         console.logger('GAddAdmin: more than the limit nums: ', admins.length + 1)
    //         reject('超过最大管理员人数限制')
    //     } else {
    //         // 没有就添加
    //         if (!admins.includes(uid)) admins.push(uid)
    //         connPool.query(
    //             'update `groups` set admins = ? where gid = ?',
    //             [admins.join(','), gid]
    //         ).then(() => {
    //             resolve()
    //         })
    //     }
    // }).catch(err => {
    //     console.logger('GAddAdmin: ', err)
    //     reject(err)
    // })
    connPool.query(
        'update ?? set role = ? where member = ?',
        [gid + '_members', role, uid]
    ).then(() => {
        resolve()
    }).catch(err => {
        console.logger('GChangeMemberRole: ', err)
        reject(err)
    })
})

const GSetOwner = (gid: string, uid: string, operator: string) => new Promise<void>((
    resolve,
    reject
) => {
    let groupName = gid + '_members'

    transaction(
        [
            'update ?? set `role` = ? where `member` = ?',
            'update ?? set `role` = ? where `member` = ?',
            'update `group` set `owner` = ? where `gid` = ?'
        ],
        [
            [groupName, 'owner', uid],
            [groupName, 'admin', operator],
            [uid, gid]
        ]
    ).then(() => {
        resolve()
    }).catch(err => {
        console.logger('GSetOwuer failed!  operator:', operator, ', uid:', uid, ', gid:', gid)
        reject(err)
    })
})

const GChangeGroupInfo = (gid: string, info: GroupChangeInfo) => new Promise((
    resolve,
    reject
) => {
    // 拼接修改命令
    let key: keyof GroupChangeInfo
    let sql = 'update `groups` set '
    let selectArr = [], values = Object.values(info)

    for (key in info) {
        if (info[key] !== undefined && info[key] !== null) {
            selectArr.push(`\`${key}\` = ?`)
        }
    }
    if (!selectArr.length) return resolve({})

    sql += selectArr.join(', ')
    sql += ` where \`gid\`='${gid}'`

    connPool.execute(
        sql,
        values
    ).then(([res]) => {
        resolve(res)
    }).catch(err => {
        console.logger('GChangeGroupInfo', err)
        reject(err)
    })
})

const GGetJoinedMembers = (gid: string) => new Promise((
    resolve: (members: {
        member: string,
        role: GroupMemberRole
    }[]) => void,
    reject
) => {
    connPool.query(
        'select `member`, `role` from ?? ',
        [gid + '_members']
    ).then(([members]) => {
        resolve(members as any)
    }).catch(err => {
        console.logger('GGetJoinedMember, err:', err)
        reject(err)
    })
})

const GCkeckGroupExist = (conditions: GroupGetGroups) => new Promise((
    resolve: (exist: boolean) => void,
    reject
) => {
    // 拼接查询命令
    let key: keyof GroupGetGroups

    let sql = 'select count(*) from `groups` where '
    let selectArr = [], values = Object.values(conditions)

    for (key in conditions) {
        if (conditions[key] !== undefined && conditions[key] !== null)
            selectArr.push(`\`${key}\` = ?`)
    }
    sql += selectArr.join(' and ')

    connPool.execute(sql, values).then(([groups]) => {
        if ((groups as any)[0]['count(*)']) resolve(true)
        else resolve(false)
    }).catch(err => {
        console.logger('GCkeckGroupExist', err)
        reject(err)
    })
})

const GIsGroupMember = (gid: string, uid: string) => new Promise((resolve, reject) => {
    connPool.query(
        'select count(*) from ?? where member = ?', 
        [gid + '_members', uid]
    ).then(([members]) => {
        if ((members as any)[0]['count(*)']) resolve(true)
        else resolve(false)
    }).catch(err => {
        console.logger('GIsGroupMember ', err)
        reject(err)
    })
})

export {
    GCreateGroup,
    GAddMessage,
    GSelectMessages,
    GRemoveMember,
    GAddMember,
    GGetJoinedMembers,
    GDeleteGroup,
    GGetGroupInfo,
    GChangeMemberRole,
    GSetOwner,
    GChangeGroupInfo,
    GCkeckGroupExist,
    GIsGroupMember
}