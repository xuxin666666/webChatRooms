import { Server, Socket } from "socket.io";
import http from 'http'
import config from "config";

import { authIo, authSocket } from '../middleware/auth'
import { groupSocket } from "../middleware/group";
import mysql from "../mysql";
import handler from "./handler";



const userJoinRooms = (socket: Socket) => new Promise((
    resolve: (value: void) => void,
    reject
) => {
    let uid = socket.data.uid as string

    mysql.AUserGetJoinedGroup(uid).then(gids => {
        gids.forEach(gid => {
            socket.join(gid)
        })
        resolve()
    }).catch(reject)
})

const userLeaveRooms = (socket: Socket) => new Promise((
    resolve: (value: void) => void,
    reject
) => {
    let uid = socket.data.uid as string

    mysql.AUserGetJoinedGroup(uid).then(gids => {
        gids.forEach(gid => {
            socket.leave(gid)
        })
        resolve()
    }).catch(reject)
})

const startSocket = (server: http.Server) => {
    let io = new Server(server, {
        cors: {
            origin: config.get('client'),
            methods: ["GET", "POST"]
        }
    })

    io.use(authIo)
    io.on('connection', async (socket) => {
        console.logger('a user connected, socket.id:', socket.id, ', uid:', socket.data.uid);

        socket.use(authSocket(socket))
        await userJoinRooms(socket)

        socket.use(groupSocket(socket))
        handler(socket, io)

        socket.on('error', (err) => {
            console.logger(err)
            socket.emit('error', err)
        })
        // socket.on('disconnect', () => {
        //     console.log(1)
        //     userLeaveRooms(socket).then(() => {
        //         console.logger('a user disconnected, socket.id:', socket.id, ', uid:', socket.data.uid)
        //     })
        // })
        // socket.on('disconnecting', () => {
        //     console.log(2)
        //     userLeaveRooms(socket).then(() => {
        //         console.logger('a user disconnected, socket.id:', socket.id, ', uid:', socket.data.uid)
        //     })
        // })
    })
}

export {
    startSocket
}