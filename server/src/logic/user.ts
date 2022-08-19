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
