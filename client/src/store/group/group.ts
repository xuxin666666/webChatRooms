import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { WritableDraft } from "immer/dist/internal";
import { Socket } from "socket.io-client";


export interface Group {
    id: number
    gid: string
    name: string
    owner: number
    avatar: string
    read: boolean
}
export interface GroupState {
    current: string
    groups: Group[]
    socket: Socket
    index: number
    timer: NodeJS.Timer | undefined
}

const initialState: GroupState = {
    current: '',
    groups: [],
    socket: null as any,
    index: 0,
    timer: undefined
}

export const groupSlice = createSlice({
    name: 'groupSlice',
    initialState,
    reducers: {
        setSocket(state, action: PayloadAction<Socket>) {
            // socket
            state.socket = (action.payload as any) as WritableDraft<Socket>
        },
        beginConnect(state, action: PayloadAction<Group[]>) {
            // group[]
            state.index = 0
            action.payload.forEach(item => {
                state.socket!.emit('connect to group', item.id)
                if (!item.read) state.index++
            })
            state.groups = action.payload
            if (action.payload.length) {
                state.current = state.groups[0].gid
                state.groups[0].read = true
            }
        },
        receivedNewMessage(state, action: PayloadAction<string>) {
            // gid
            // 接收到消息后，群的位置前移
            for (let i = 0, len = state.groups.length; i < len; i++) {
                if (state.groups[i].gid === action.payload) {
                    if (state.groups[i].gid !== state.current) {
                        state.groups[i].read = false
                    }
                    if (state.index < i) {
                        state.groups.splice(state.index, 0, state.groups.splice(i, 1)[0])
                        state.index++
                    }
                    break
                }
            }
        },
        addGroup(state, action: PayloadAction<Group>) {
            // group
            let flag = true, newGroup = action.payload

            // 判断是否已经加入
            for (let i = 0, len = state.groups.length; i < len; i++) {
                if (newGroup.gid === state.groups[i].gid) {
                    flag = false
                    break
                }
            }
            if (flag) {
                state.groups.splice(state.index, 0, newGroup)
                state.socket.emit('connect to group', newGroup.gid)
                state.index++
            }
        },
        removeGroup(state, action: PayloadAction<string>) {
            // gid
            let index = state.groups.findIndex(item => item.gid === action.payload)
            if (index !== -1) {
                state.groups.splice(index, 1)
                state.current = ''
                if (state.index >= state.groups.length) {
                    state.index--
                }
            }
        },
        resetIndex(state) {
            state.index = 0
            state.timer = undefined
        },
        clearTimer(state) {
            clearTimeout(state.timer)
            state.timer = undefined
        },
        setTimer(state, action: PayloadAction<NodeJS.Timer>) {
            // timeout id
            state.timer = action.payload
        },
        setCurrent(state, action: PayloadAction<string>) {
            // gid
            state.current = action.payload
            for (let i = 0, len = state.groups.length; i < len; i++) {
                if (state.groups[i].gid === action.payload) {
                    state.groups[i].read = true
                }
            }
        }
    }
})

export const { setSocket, addGroup, resetIndex, receivedNewMessage, beginConnect, clearTimer, setTimer, setCurrent, removeGroup } = groupSlice.actions


export default groupSlice.reducer