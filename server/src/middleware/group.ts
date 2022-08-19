import { Request, Response, NextFunction } from 'express'
import { Socket, Event } from 'socket.io'

import mysql from '../mysql'
import PERMISSION from '../pkg/permission'



export const isGroupExist = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let gid = (req.query && req.query.gid) || (req.body && req.body.gid)

        if (!gid) {
            res.status(412).send({
                msg: '缺少参数'
            })
        }
        mysql.GCkeckGroupExist({ gid }).then(() => {
            next()
        }).catch(err => {
            res.status(412).send({
                msg: '参数有误'
            })
        })
    } catch (err) {
        res.status(500).end()
    }
}

export const isGroupOwner = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let gid = req.body.gid, uid = res.locals.uid

        mysql.GGetGroupInfo({ gid: gid }).then((groups) => {
            let group = groups[0]
            if (uid === group.owner) {
                next()
            } else {
                res.status(403).send({
                    msg: '您不是该群的所有者'
                })
            }
        }).catch(err => {
            res.status(404).send({
                msg: '未找到该群'
            })
        })
    } catch (err) {
        res.status(500).end()
    }
}

export const groupSocket = (socket: Socket) => async (packet: Event, next: (err?: Error | undefined) => void) => {
    // packet: 数组，第一个元素为事件名，后面的为客户端触发事件传来的参数
    let ev = packet[0], uid = socket.data.uid as string

    if (ev === 'dissolve group') {
        let gid = packet[1] as string

        let able = (await PERMISSION.getUserPermissionsByID(uid)).GROUP_DELETE
        if(!able) {
            let isMember = await mysql.GIsGroupMember(gid, uid)
            if(!isMember) {
                let err = new Error('解散群聊：权限不够，uid:' + uid + ' gid:' + gid)
                err.data = {
                    status: 403,
                    msg: '权限不够'
                }
                return next(err)
            }

            able = (await PERMISSION.getGroupPermissionsByID(gid, uid)).GROUP_DELETE
            if(!able) {
                let err = new Error('解散群聊：权限不够，uid:' + uid + ' gid:' + gid)
                err.data = {
                    status: 403,
                    msg: '权限不够'
                }
                return next(err)
            }
        }

        next()
    } else {
        next()
    }
}