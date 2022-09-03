import sizeOf from 'image-size'
import path from 'path'

import mysql from "../mysql"
import PERMISSION, {GroupMemberRoles} from '../pkg/permission';
import { GroupMemberRole } from '../pkg/permission';
import { GroupGetGroups, GroupInfo } from '../model/group'


const GGetLotMessages = (gid: string, lastTimestamp: number, nums: number | string = 50) => new Promise((
    resolve: (messages: {
        text: string;
        type: string;
        avatar: string;
        username: string;
        uid: number;
        create_time: number;
        width?: number;
        height?: number;
    }[]) => void,
    reject
) => {
    mysql.GSelectMessages(gid, nums, lastTimestamp).then(messages => {
        let proms = []
        for (let i = 0; i < messages.length; i++) {
            proms.push(new Promise((res: (value: void) => void, rej) => {
                mysql.AGetUserInfo({ uid: messages[i].publisher }).then(uInfo => {
                    let { avatar, username, id } = uInfo
                    messages[i].avatar = '/avatars/' + avatar
                    messages[i].username = username
                    messages[i].uid = id!
                    delete messages[i].publisher
                    if (messages[i].type === 'image') {
                        messages[i].text = '/images/' + messages[i].text
                        sizeOf(
                            path.join(__dirname, '../../uploads', messages[i].text),
                            function (err, dims) {
                                if (err) {
                                    console.logger('GGetLotMessages: read image failed: ', err)
                                    return rej(err)
                                }
                                messages[i].width = dims?.width
                                messages[i].height = dims?.height
                                res()
                            }
                        )
                    } else res()
                }).catch(rej)
            }))
        }
        Promise.all(proms).then(() => {
            resolve(messages as any)
        }).catch(reject)
    })
})

const GGetGroupInfo = (conditions: GroupGetGroups, uid?: string) => new Promise((
    resolve: (groupInfo: GroupInfo) => void,
    reject
) => {
    mysql.GGetGroupInfo(conditions).then((groups) => {
        let info = groups[0]
        if (uid) {
            mysql.AGetGroupReadStatus(uid, info.gid).then((read) => {
                resolve({
                    ...info,
                    read: Boolean(read)
                })
            })
        } else {
            resolve({
                ...info,
            })
        }
    }).catch(reject)
})

const GGetMembers = (gid: string) => new Promise((
    resolve: (membersInfo: {
        role: string,
        username: string,
        uid: number,
        avatar: string,
        block: number
    }) => void,
    reject
) => {
    mysql.GGetJoinedMembers(gid).then(members => {
        let promArr = members.map(member => {
            return new Promise((reso, reje) => {
                mysql.AGetUserInfo({ uid: member.member }).then((userInfo) => {
                    reso({
                        role: member.role,
                        username: userInfo.username,
                        uid: userInfo.id,
                        avatar: '/avatars/' + userInfo.avatar,
                        block: userInfo.blocked_time
                    })
                }).catch(err => reje(err))
            })
        })
        Promise.all(promArr).then(membersInfo => {
            resolve(membersInfo as any)
        }).catch(reject)
    }).catch(reject)
})

const GChangeMemberRole = (gid: string, uid: string, role: GroupMemberRole, operator?: string) => new Promise((
    resolve,
    reject
) => {
    if (role === GroupMemberRoles.owner) {
        if (!operator) {
            console.logger('GChangeMemberRole: 参数有误: operator', operator)
            return reject('参数有误')
        }
        mysql.GSetOwner(gid, uid, operator).then(resolve).catch(reject)
    } else {
        mysql.GChangeMemberRole(uid, gid, role).then(resolve).catch(reject)
    }
})

const GDeleteGroup = async (uid: string, gid: string) => {
    await mysql.GDeleteGroup(gid)
}

export {
    GGetLotMessages,
    GGetGroupInfo,
    GGetMembers,
    GChangeMemberRole,
    GDeleteGroup
}