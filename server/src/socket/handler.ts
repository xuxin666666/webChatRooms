import { Socket, Server } from 'socket.io';
import sizeOf from 'image-size'
import path from 'path';
import fs from 'fs'

import mysql from '../mysql';
import logic from '../logic';
import { getNewFileName } from '../pkg/file'


const saveImage = (filename: string, data: NodeJS.ArrayBufferView) => new Promise((resolve, reject) => {
    fs.writeFile(path.join(__rootpath, '../uploads/images', filename), data, (err) => {
        if (err) {
            console.logger('saveImage, err:', err)
            return reject(err)
        }
        resolve(0)
    })
})

export default (socket: Socket, io: Server) => {
    socket.on('connect to group', (gid: string) => {
        socket.join(gid)

        let uid = socket.data.uid
        console.log(`${uid} has joined the room: ${gid}`)
    })
    socket.on('new message', async ({ gid, text, type }, callback: Function) => {
        try {
            let uid = socket.data.uid, file = text, width, height

            if (type === 'image') {
                let dim = sizeOf(text)
                text = getNewFileName(null, '.' + dim.type)
                width = dim.width
                height = dim.height
            }

            let [{ avatar, username, id }, create_time] = await Promise.all([
                mysql.AGetUserInfo({ uid }),
                mysql.GAddMessage(gid, text, type, uid),
                type === 'image' && saveImage(text, file)
            ])

            let res: {
                type: string;
                text: string;
                username: string;
                uid: number;
                create_time: number;
                avatar: string;
                width?: number;
                height?: number;
            } = { type, text, username, uid: id!, create_time, avatar: '/avatars/' + avatar }
            if (type === 'image') {
                res.text = '/images/' + text
                res.width = width
                res.height = height
            }
            io.to(gid).emit('new message', res, gid)

            callback && callback()
        } catch (err) {
            socket.emit('error')
        }
    }),
    socket.on('dissolve group', async (gid: string, callback: Function) => {
        try {
            let uid = socket.data.uid
            if (!uid && !gid) throw new Error('参数有误')

            await logic.GDeleteGroup(uid, gid)
            io.to(gid).emit('dissolve group', gid)
            callback()
        } catch (err) {
            callback(err)
        }
    })
}