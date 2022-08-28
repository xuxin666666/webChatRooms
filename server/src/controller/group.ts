import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import formidable from 'formidable'

import mysql from '../mysql'
import PERMISSION, {GroupMemberRoles} from '../pkg/permission'
import logic from '../logic'
import { saveAvatar, saveImage } from '../pkg/file'
import { validate } from '../pkg/joi'
import getUUID from '../pkg/uuid'


const GGetMessages = async (req: Request, res: Response) => {
    try {
        let { gid, lastTimestamp, nums } = req.query

        let Nlast = Number(lastTimestamp)
        // console.log(gid)
        if (nums !== '100') nums = '50'

        if (!Nlast) Nlast = -1
        let messages = await logic.GGetLotMessages(gid as string, Nlast, nums)

        res.json(messages)
    } catch (e) {
        res.status(500).end()
    }
}

const GGetGroups = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid

        let gids = await mysql.AUserGetJoinedGroup(uid)
        let proms: any[] = []
        gids.forEach((gid) => {
            proms.push(new Promise((resolve, reject) => {
                logic.GGetGroupInfo({ gid }, uid).then(info => {
                    mysql.AGetUserInfo({ uid: info.owner }).then(userInfo => {
                        resolve({
                            id: info.id,
                            gid: info.gid,
                            name: info.name,
                            owner: userInfo.id,
                            avatar: '/avatars/' + info.avatar,
                            read: info.read
                        })
                    })
                })
            }))
        })
        Promise.all(proms).then((infos) => {
            res.send(infos)
        })
    } catch (e) {
        res.status(500).end()
    }
}

const GGetMembers = async (req: Request, res: Response) => {
    try {
        let { gid } = req.query

        let members = await logic.GGetMembers(gid as string)
        res.json(members)
    } catch (err) {
        res.status(500).end()
    }
}

const GChangeMemberRole = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid
        let { set, target, gid } = req.body

        if (typeof target !== 'string' || typeof gid !== 'string' || PERMISSION.checkGroupRoleParams(set)) {
            return res.status(412).send({
                msg: '参数有误'
            })
        }

        let able = await PERMISSION.canSetGroupRole(uid, target, set)
        if(!able) {
            return res.status(403).json({
                msg: '无权限'
            })
        }

        await logic.GChangeMemberRole(gid, target, set, uid)
        res.end()
    } catch (e) {
        res.status(500).end()
    }
}

const GChangeAvatar = async (req: Request, res: Response) => {
    try {
        let { files, fields } = await saveAvatar(req)
        let uid = res.locals.uid, {gid} = fields, filename = (files.avatar as formidable.File).newFilename

        if (typeof gid !== 'string') {
            return res.status(412).send({
                msg: '参数有误'
            })
        }

        let changeAble = (await PERMISSION.getGroupPermissionsByID(gid, uid)).GROUP_SET_INFO
        if(!changeAble) {
            return res.status(403).end()
        }

        let [{ avatar }] = await mysql.GGetGroupInfo({ gid })
        console.log(avatar)
        if (avatar && avatar !== 'defaultGroup.png') {
            // 删掉旧的头像文件
            let p = path.join(__dirname, '../../uploads/avatars', avatar)
            if (fs.existsSync(p)) fs.rmSync(p)
        }

        await mysql.GChangeGroupInfo(gid, { avatar: filename })
        res.send('/avatars/' + filename)
    } catch (e) {
        res.status(500).end()
    }
}

const GChangeBasicInfos = async (req: Request, res: Response) => {
    try {
        let { name, description, gid } = req.body, uid = res.locals.uid

        if (
            !gid ||
            (name && !validate('groupname', name)) ||
            (description && !validate('description', description))
        ) {
            return res.status(412).json({
                msg: '格式错误'
            })
        }

        let changeAble = (await PERMISSION.getGroupPermissionsByID(gid, uid)).GROUP_SET_INFO
        if(!changeAble) {
            return res.status(403).end()
        }

        let map: {[key: string]: any} = {}
        if(name) map.name = name
        if(description) map.description = description

        await mysql.GChangeGroupInfo(gid, map)

        let info = await logic.GGetGroupInfo({ gid })
        res.json({
            id: info.id,
            max_num: info.max_num,
            gid: info.gid,
            name: info.name,
            description: info.description,
            owner: info.owner,
            admins: info.admins
        })
    } catch {
        res.status(500).end()
    }
}

const GCreateGroup = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid
        let { name, description } = req.body

        if (
            !validate('groupname', name) ||
            (description && !validate('description', description))
        ) {
            return res.status(412).json({
                msg: '格式错误'
            })
        }

        let gid = getUUID()
        let id = await mysql.GCreateGroup({
            name,
            description,
            gid,
            owner: uid
        })
        await mysql.AUserJoinGroup(uid, gid, GroupMemberRoles.owner)

        res.json({
            gid,
            id,
            avatar: '/avatars/defaultGroup.png'
        })
    } catch (e) {
        res.status(500).end()
    }
}

// 群主或管理员可删
const GDeleteGroup = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid
        let { gid } = req.body

        if (!gid) {
            return res.status(412).json({
                msg: '格式错误'
            })
        }

        let able = (await PERMISSION.getUserPermissionsByID(uid)).GROUP_DELETE
        if(!able) {
            let isMember = await mysql.GIsGroupMember(gid, uid)
            if(!isMember) return res.status(403).end()

            able = (await PERMISSION.getGroupPermissionsByID(gid, uid)).GROUP_DELETE
            if(!able) return res.status(403).end()
        }

        await logic.GDeleteGroup(uid, gid)

        res.end()
    } catch (e) {
        res.status(500).end()
    }
}

const GGetGroupInfo = async (req: Request, res: Response) => {
    try {
        let { id: gid } = req.query

        let [{avatar, owner, name, description}] = await mysql.GGetGroupInfo({gid: String(gid)})
        let {id, username} = await mysql.AGetUserInfo({uid: owner})
        res.json({
            avatar: '/avatars/' + avatar,
            owner: id,
            ownerName: username,
            name, description
        })
    } catch(err) {
        res.status(500).end()
    }
}

const GSearchGroup = async (req: Request, res: Response) => {
    try {
        let { id } = req.query
        let uid = res.locals.uid

        let [{ avatar, owner, name, description, gid }] = await mysql.GGetGroupInfo({ id: Number(id) })
        let { username } = await mysql.AGetUserInfo({ uid: owner })
        let members = await mysql.GGetJoinedMembers(gid)
        let joined: boolean = false

        for (let i = 0; i < members.length; i++) {
            if (members[i].member === uid) {
                joined = true
                break
            }
        }
        res.send({
            avatar: '/avatars/' + avatar,
            username, name, description, gid, joined
        })
    } catch (e) {
        res.status(500).end()
    }
}

const GJoinGroup = async (req: Request, res: Response) => {
    try {
        let uid = res.locals.uid
        let { gid } = req.body

        let [{ id }] = await mysql.GGetGroupInfo({ gid })
        await mysql.AUserJoinGroup(uid, gid)

        res.json({ id })
    } catch (e) {
        res.status(500).end()
    }
}

export {
    GGetMessages,
    GGetGroups,
    GChangeMemberRole,
    GChangeBasicInfos,
    GChangeAvatar,
    GCreateGroup,
    GDeleteGroup,
    GSearchGroup,
    GJoinGroup,
    GGetMembers,
    GGetGroupInfo
}