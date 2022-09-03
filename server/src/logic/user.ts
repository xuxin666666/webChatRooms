import PERMISSION from "../pkg/permission"
import mysql from "../mysql"
import schedule from "../pkg/schedule"


export const ABlockUser = async (uid: string, targetUid: string, time: number) => {
    try {
        let able = (await PERMISSION.getUserPermissionsByID(uid, targetUid)).USER_SET_BLOCK
        if (!able) return false

        await mysql.AChangeUserInfo(targetUid, {
            blocked_time: Date.now() + time
        })
        // 添加定时任务
        schedule.addTask(() => {
            AUnBlockUser(uid, targetUid, true)
        }, time)

        return true
    } catch (err) {
        console.logger('ABlockUser: user:', uid, ', targetUser:', targetUid, ', time:', time, '--', err)
        throw err
    }
}

export const AUnBlockUser = async (uid: string, targetUid: string, anyway?: boolean) => {
    try {
        if (!anyway) {
            let able = (await PERMISSION.getUserPermissionsByID(uid, targetUid)).USER_SET_BLOCK
            if (!able) return false
        }

        await mysql.AChangeUserInfo(targetUid, {
            blocked_time: 0
        })
        return true
    } catch (err) {
        console.logger('AUnBlockUser: user:', uid, ', targetUser:', uid, '--', err)
        throw err
    }
}

export const AUpdateLastOnline = (uid: string) => new Promise((resolve, reject) => {
    mysql.AChangeUserInfo(uid, {last_online: Date.now()}).then(resolve).catch(reject)
})

interface Conditions {
    role: string[]
    block: number[]
    order: 1 | -1
}
const roles = ['normal', 'admin', 'seniorAdmin', 'topAdmin']
const blocks = [0, 1, 7, 30, 90, 365, -1]
const handleRole = (conditions: Conditions) => {
    if (!conditions.role || !conditions.role.length) return ''
    else {
        let sql: string[] = [], flag = 0
        roles.forEach(item => {
            if (conditions.role.includes(item)) {
                sql.push(`\`role\`='${item}'`)
                flag += 1
            }
        })
        if (flag === roles.length) return ''
        else return `(${sql.join(' or ')})`
    }
}
const handleBlock = (conditions: Conditions) => {
    if (!conditions.block || !conditions.role.length) return ''
    else {
        let sql: string[] = [],
            arr: number[] = [],
            result: number[] = [],
            day = 86400000,
            now = Date.now()

        if(blocks.every(item => conditions.block.includes(item))) return ''

        // 为了合并相邻的时间段，先根据 conditions.block 依次向数组添加起止点
        blocks.forEach((item, index) => {
            if (conditions.block.includes(item)) {
                if(item === 0) arr.push(-Infinity, 0)
                else if(item === -1) arr.push(blocks[index - 1], Infinity)
                else arr.push(blocks[index - 1], item)
            }
        })

        // 再遍历消除相邻的相同的起止点
        result.push(arr[0])
        for(let i = 1; i < arr.length - 1; i += 2) {
            if(arr[i] !== arr[i + 1]) result.push(arr[i], arr[i + 1])
        }
        result.push(arr[arr.length - 1])

        // 最终转为sql，并去掉 Infinity
        for(let i = 0; i < result.length; i += 2) {
            if(result[i] === -Infinity) sql.push(`blocked_time <= ${now + result[i + 1] * day}`)
            else if(result[i + 1] === Infinity) sql.push(`blocked_time > ${now + result[i] * day}`)
            else sql.push(`(blocked_time > ${now + result[i] * day} and blocked_time <= ${now + result[i + 1] * day})`)
        }
        return `(${sql.join(' or ')})`
    }
}
const handleOrder = (conditions: Conditions) => {
    if(conditions.order === -1) {
        return 'order by create_time desc'
    } else return 'order by create_time'
}
export const AFilterUsers = async (conditions: Conditions, page: number, pageSize: number = 10) => {
    try {
        let roleRes = handleRole(conditions), blockRes = handleBlock(conditions), orderRes = handleOrder(conditions)

        let res = await Promise.all([
            mysql.AGetAndFilterUsers({
                role: roleRes,
                block: blockRes,
                order: orderRes
            }, page, pageSize),
            mysql.AGetUsersNum({
                role: roleRes,
                block: blockRes,
                order: orderRes
            })
        ])
        
        return res
    } catch (err) {
        console.logger('AFilterUsers: failed! conditions: ', conditions)
        return Promise.reject(err)
    }
}