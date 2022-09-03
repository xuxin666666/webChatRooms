import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { Request, Response } from 'express'

import {
    validateUserRegister,
    validateUserLogin,
    validateEmail,
    validatePassword,
    validate
} from '../pkg/joi'
import { emailStore } from '../pkg/store'
import { saveAvatar } from '../pkg/file'
import PERMISSION, {UserRoles} from '../pkg/permission'

import mysql from '../mysql'
import logic from '../logic'
import getUUID from '../pkg/uuid'
import sendEmail from '../pkg/sendEmail'
import JWT from '../pkg/jwt'
import Bcrypt from '../pkg/bcrypt'


const ALogin = async (req: Request, res: Response) => {
    try {
        let { email, password: pwdReq } = req.body
        // 检查参数
        if (!validateUserLogin(req.body)) {
            return res.status(412).send({
                status: 412,
                msg: '密码或邮箱有误'
            })
        }

        // 查询信息
        let uids = await mysql.AGetUserInfo({ email })
        if (!uids) {
            return res.status(412).send({
                status: 412,
                msg: '密码或邮箱有误'
            })
        }

        let { uid, password: PwdSql, avatar, username, blocked_time, message_alert, id } = uids

        // 验证信息
        if (!Bcrypt.verify(pwdReq, PwdSql)) {
            return res.status(412).send({
                status: 412,
                msg: '密码或邮箱有误'
            })
        }

        // 验证是否被封号
        if(blocked_time) {
            return res.status(400).json({
                status: 400,
                blocked_time
            })
        }

        await logic.AUpdateLastOnline(uid)

        let token = JWT.generate({ uid })
        res.send({
            token,
            username,
            avatar: '/avatars/' + avatar,
            email,
            messageAlertable: message_alert,
            uid: id
        })
    } catch {
        res.status(500).end()
    }
}

const AAutoLogin = async (req:Request, res: Response) => {
    try {
        let uid = res.locals.uid as string

        // 查询信息
        let {username, avatar, id, email, message_alert} = await mysql.AGetUserInfo({ uid })
        
        await logic.AUpdateLastOnline(uid)

        res.json({
            username,
            avatar: '/avatars/' + avatar,
            email,
            messageAlertable: message_alert,
            uid: id
        })
    } catch {
        res.status(500).end()
    }
}

const ARegister = async (req: Request, res: Response) => {
    try {
        let { username, password, email, code } = req.body

        let exist = await mysql.ACheckUserExist({ email })
        if (exist) {
            return res.status(418).send({
                status: 418,
                msg: '邮箱不存在或已被注册'
            })
        }

        if (!validateUserRegister(req.body) || !emailStore.check(email, code)) {
            return res.status(412).send({
                status: 412,
                msg: '昵称、密码或验证码有误'
            })
        }

        password = Bcrypt.encrypt(password)
        await mysql.ACreateUser({
            username,
            password,
            email,
            uid: getUUID(),
            create_time: Date.now()
        })

        res.send({
            status: 200,
            msg: '注册成功'
        })
    } catch {
        res.status(500).end()
    }
}

// 参数带邮箱的验证码
const ASendValidateCode = async (req: Request, res: Response) => {
    let { email } = req.body
    if (!email || !validateEmail(email)) {
        return res.status(418).send({
            status: 418,
            msg: '邮箱格式有误'
        })
    }

    // 生成验证码
    let code = emailStore.generate(email)

    // 发邮件
    sendEmail(email, code)
        .then(() => {
            res.send({
                status: 200,
                msg: '验证码发送成功'
            })
        })
        .catch(err => {
            console.logger(err)
            res.status(418).send({
                status: 418,
                msg: '邮箱不存在或已被注册'
            })
        })
}

// 参数不带邮箱的验证码
const ASendValidateCode2 = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string

        let { email } = await mysql.AGetUserInfo({uid})
        // 生成验证码
        let code = emailStore.generate(email)
    
        // 发邮件
        sendEmail(email, code)
            .then(() => {
                res.send({
                    status: 200,
                    msg: '验证码发送成功'
                })
            })
            .catch(err => {
                console.logger(err)
                res.status(418).send({
                    status: 418,
                    msg: '邮箱不存在'
                })
            })
    } catch(err) {
        res.status(500).end()
    }
    
} 

const AChangeAvatar = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string

        let { files } = await saveAvatar(req)
        let filename = (files.avatar as formidable.File).newFilename

        let { avatar } = await mysql.AGetUserInfo({ uid })
        if (avatar && avatar !== 'defaultUser.png') {
            // 删掉旧的头像文件
            let p = path.join(__dirname, '../../uploads/avatars', avatar)
            if (fs.existsSync(p)) fs.rmSync(p)
        }

        await mysql.AChangeUserInfo(uid, { avatar: filename })
        res.send('/avatars/' + filename)
    } catch (e) {
        res.status(500).end()
    }
}

const AChangePassword = (req: Request, res: Response) => {
    let uid = res.locals.uid as string
    let { password, newPassword } = req.body

    mysql.AGetUserInfo({ uid })
        .then(({ password: pwdSql }) => {
            let result = Bcrypt.verify(password, pwdSql)
            let result2 = validatePassword(newPassword)
            if (!result || !result2) {
                res.status(412).json({
                    msg: '密码错误或格式有问题'
                })

            } else {
                newPassword = Bcrypt.encrypt(newPassword)
                mysql.AChangeUserInfo(uid, { password: newPassword })
                    .then(() => {
                        res.json({
                            msg: '密码修改成功'
                        })
                    })
            }
        })
        .catch(() => {
            res.status(500).end()
        })
}

const AChangeEmail = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { email, code } = req.body

        if(!validateEmail(email)) {
            return res.status(412).json({
                msg: '邮箱格式有问题'
            })
        }

        let exist = await mysql.ACheckUserExist({email})
        if(exist) {
            return res.status(412).json({
                msg: '邮箱已存在'
            })
        }
        
        let {email: old, role} = await mysql.AGetUserInfo({uid})
        // 顶级管理员不需要验证码
        if(!emailStore.check(old, code) && role !== 'topAdmin') {
            return res.status(412).json({
                msg: '验证码错误'
            })
        }

        await mysql.AChangeUserInfo(uid, {email})
        res.end()
    } catch {
        res.end(500)
    }
}

const AResetPassword = (req: Request, res: Response) => {
    let uid = res.locals.uid as string
    let { password, code } = req.body

    if (!validatePassword(password)) {
        return res.status(412).json({
            msg: '密码格式有问题'
        })
    }
    mysql.AGetUserInfo({ uid })
        .then(({ email }) => {
            if (!emailStore.check(email, code)) {
                return res.status(412).json({
                    msg: '验证码错误'
                })
            }
            password = Bcrypt.encrypt(password)
            mysql.AChangeUserInfo(uid, { password })
                .then(() => {
                    res.json({
                        msg: '密码修改成功'
                    })
                })
        })
        .catch(() => {
            res.status(500).end()
        })
}

const AProfile = async (req: Request, res: Response) => {
    try {
        let {username, gender, signature, birthday} = req.body
        let uid = res.locals.uid as string

        if (
            (username && !validate('username', username)) ||
            (gender && !validate('gender', gender)) ||
            (signature && !validate('signature', signature)) ||
            (birthday && !validate('birthday', birthday))
        ) {
            return res.status(412).json({
                msg: '格式错误'
            })
        }
        await mysql.AChangeUserInfo(uid, {username, gender, signature, birthday})
        
        let info = await mysql.AGetUserInfo({uid})
        res.json({
            username: info.username,
            gender: info.gender,
            uid: info.id,
            email: info.email,
            birthday: info.birthday,
            role: info.role,
            last_online: info.last_online,
            signature: info.signature
        })
    } catch {
        res.status(500).end()
    }
}

const AGetUserRole = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string

        let {role} = await mysql.AGetUserInfo({uid})

        res.send(role)
    } catch(err) {
        res.status(500).end()
    }
}

const AChangeUserRole = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { uid: targetID, role: targetRole } = req.body

        if(!Number.isInteger(targetID) || !PERMISSION.checkUserRoleParams(targetRole)) {
            return res.status(412).json({
                msg: '参数有误'
            })
        }
        
        let {uid: targetUID} = await mysql.AGetUserInfo({id: targetID})

        let able = await PERMISSION.canSetUserRole(uid, targetUID, targetRole)
        
        if (!able) {
            return res.status(403).end()
        }

        // 修改被修改者的信息
        await mysql.AChangeUserInfo(targetUID, { role: targetRole })

        res.end()
    } catch {
        res.status(500).end()
    }
}

const ABlockUser = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { uid: targetID, time } = req.body

        if(!Number.isInteger(targetID) || !Number.isInteger(time) || time < 0) {
            return res.status(412)
        }

        let {uid: targetUID} = await mysql.AGetUserInfo({id: targetID})

        let success = await logic.ABlockUser(uid, targetUID, time)

        if (success) res.end()
        else res.status(403).end()
    } catch {
        res.status(500).end()
    }
}

const AUnBlockUser = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { uid: targetID } = req.body

        if(!Number.isInteger(targetID)) {
            return res.status(412)
        }

        let {uid: targetUID} = await mysql.AGetUserInfo({id: targetID})

        let success = await logic.AUnBlockUser(uid, targetUID)

        if (success) res.end()
        else res.status(403).end()
    } catch {
        res.status(500).end()
    }
}

const AGetMessageStatus = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string

        let {message_system_read, message_other_read} = await mysql.AGetUserInfo({uid})
        let lastOne = await mysql.AGetSystemMessage(0, 1)
        let index = lastOne[0].id
        
        res.json({
            system: message_system_read! >= index, // >=表示已读
            other: Boolean(message_other_read)
        })
    } catch {
        res.status(500).end()
    }
}

const AGetSystemMessage = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { start } = req.query

        let messages = await mysql.AGetSystemMessage(start as string)
        // 更改最新已读到的系统消息的id
        let lastOne = await mysql.AGetSystemMessage(0, 1)
        let index = lastOne[0].id
        await mysql.AChangeUserInfo(uid, {message_system_read: index})
        res.send(messages)
    } catch {
        res.status(500).end()
    }
}

const AGetOtherMessage = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { start } = req.query

        let messages = await mysql.AGetOtherMessage(uid, start as string)
        await mysql.AChangeUserInfo(uid, {message_other_read: 1})
        res.send(messages)
    } catch {
        res.status(500).end()
    }
}

// 是否开启消息提醒
const AMessageAlert = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { able } = req.body

        if(typeof able === 'boolean') {
            await mysql.AChangeUserInfo(uid, {message_alert: Number(able)})
        }

        let {message_alert} = await mysql.AGetUserInfo({uid})
        res.json({
            able: Boolean(message_alert)
        })
    } catch {
        res.status(500).end()
    }
}

// 是否接收系统通知
const AMessageSystem = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid as string
        let { able } = req.body

        if(typeof able === 'boolean') {
            await mysql.AChangeUserInfo(uid, {message_system: Number(able)})
        }
        
        let {message_system} = await mysql.AGetUserInfo({uid})
        res.json({
            able: Boolean(message_system)
        })
    } catch {
        res.status(500).end()
    }
}

const AFilterUsers = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid, 
            {block, order, role, page} = req.body

        let able = (await PERMISSION.getUserPermissionsByID(uid)).USER_VIEW_USERS
        if(!able) return res.status(403).end()

        if(!Array.isArray(block)
            || !Array.isArray(role) 
            || ![1, -1].includes(order)
            || !(Number.isInteger(page) && page >= 0)
        ) {
            return res.status(412).end()
        }

        let [users, total] = await logic.AFilterUsers({block, order, role}, page)

        res.json({
            users: users.map(item => ({
                uid: item.id,
                username: item.username,
                email: item.email,
                avatar: '/avatars/' + item.avatar,
                role: item.role,
                last_online: item.last_online,
                create_time: item.create_time,
                blocked_time: item.blocked_time
            })),
            total
        })
    } catch(err) {
        res.status(500).end()
    }
}

const ADeleteAvatar = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid
        let {uid: targetID} = req.body

        if(!Number.isInteger(targetID)) {
            return res.status(412)
        }

        let {uid: targetUID} = await mysql.AGetUserInfo({id: targetID})

        let able = (await PERMISSION.getUserPermissionsByID(uid, targetUID)).USER_DELETE_AVATAR
        if(!able) {
            return res.status(403).end()
        }

        let { avatar } = await mysql.AGetUserInfo({ uid: targetUID })
        if (avatar && avatar !== 'defaultUser.png') {
            // 删掉旧的头像文件
            let p = path.join(__dirname, '../../uploads/avatars', avatar)
            if (fs.existsSync(p)) fs.rmSync(p)
        }

        await mysql.AChangeUserInfo(targetUID, {avatar: 'defaultUser.png'})

        res.send('/avatars/defaultUser.png')
    } catch(err) {
        res.status(500).end()
    }
}

const ASearchUser = async (req: Request, res: Response) => {
    try {
        let {uid} = req.query

        let info = await mysql.AGetUserInfo({id: Number(uid)})

        res.json({
            uid: info.id,
            username: info.username,
            email: info.email,
            avatar: '/avatars/' + info.avatar,
            role: info.role,
            last_online: info.last_online,
            create_time: info.create_time,
            blocked_time: info.blocked_time
        })
    } catch(err) {
        res.status(500).end()
    }
}

export {
    ALogin,
    AAutoLogin,
    ASendValidateCode,
    ASendValidateCode2,
    ARegister,
    AChangeAvatar,
    AChangePassword,
    AResetPassword,
    AProfile,
    AChangeUserRole,
    ABlockUser,
    AUnBlockUser,
    AGetMessageStatus,
    AGetSystemMessage,
    AGetOtherMessage,
    AMessageAlert,
    AMessageSystem,
    AChangeEmail,
    AGetUserRole,
    AFilterUsers,
    ADeleteAvatar,
    ASearchUser
}