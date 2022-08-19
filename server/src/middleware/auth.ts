import { Request, Response, NextFunction } from 'express'
import { Socket, Event } from 'socket.io'
import { ExtendedError } from 'socket.io/dist/namespace'

import JWT from '../pkg/jwt'
import mysql from '../mysql'

// 验证token，使用的是Bearer token
const authorize = (token: string) => {
    // 没有携带token则直接返回
    if (!token) return false

    // authorization参数有误，直接返回
    let parts = token.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return false
    }

    // 验证token的正确性
    let info = JWT.verify(parts[1])
    if (!info) {
        return false
    }

    return info.uid
}

// 这里使用的是Bearer token
const authHttp = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authorization = req.headers.authorization

        let result = authorize(authorization!)
        if (!result) {
            return res.status(401).send({
                status: 401,
                msg: '未登录或登录状态失效'
            })
        }

        let { blocked_time } = await mysql.AGetUserInfo({ uid: result })
        if (blocked_time) {
            return res.status(400).send({
                status: 400,
                msg: '您已被封号',
                blocked_time
            })
        }

        res.locals.uid = result
        next()
    } catch {
        res.status(500).end()
    }
}

const authIo = (socket: Socket, next: (err?: ExtendedError | undefined) => void) => {
    const token = socket.handshake.auth.token

    let result = authorize('Bearer ' + token)
    if (!result) {
        let err = new Error('未登录或登录状态失效')
        err.data = {
            status: 401,
            msg: '未登录或登录状态失效'
        }
        return next(err)
    }

    socket.data.uid = result
    next()
}

const authSocket = (socket: Socket) => async (packet: Event, next: (err?: Error | undefined) => void) => {
    // packet: 数组，第一个元素为事件名，后面的为客户端触发事件传来的参数

    let uid = socket.data.uid as string

    let { blocked_time } = await mysql.AGetUserInfo({ uid })
    if (blocked_time) {
        let err = new Error('您已被封号')
        err.data = {
            status: 400,
            msg: '您已被封号',
            blocked_time
        }
        return next(err)
    }

    next()
}


export {
    authHttp,
    authIo,
    authSocket
}