import React, { useState, useCallback, useEffect } from 'react'
import { List, Badge, Modal, Drawer } from 'antd'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

import ContextMenu from '../components/ContextMenu'
import GroupMember from './groupMember'
import Image from '../components/Image'
import { message } from '../pkg';
import type {States, Dispatches} from './container/groupListContainer'

import './scss/groupsList.scss'


type Group = InferArray<States['groups']>

interface SocketError extends Error {
    data: {
        msg: string
        [key: string]: any
    }
}

// 很多群？
// 分批次，优先获取有新消息的群，再请求时不获取已获取的群？
const GroupsList: React.FC<{
    groupState: States
    beginConnect: Dispatches['beginConnect']
    receivedNewMessage: Dispatches['receivedNewMessage']
    removeGroup: Dispatches['removeGroup']
    setCurrent: Dispatches['setCurrent']
}> = ({ groupState, beginConnect, receivedNewMessage, removeGroup, setCurrent }) => {
    const { groups, socket, current } = groupState

    let navigate = useNavigate()

    const [operating, setOperating] = useState<Group>() // 右键正在操作的群
    // const [disabled, setDisabled] = useState(false)
    const [drawerVis, setDrawerVis] = useState(false)


    const getGroupList = useCallback(() => {
        axios.get('/group/getGroup').then(({ data }) => {
            // {id, gid, name, owner, avatar, read}[]
            data.sort((a: Group, b: Group) => Number(a.read) - Number(b.read))
            beginConnect(data)
        }).catch(err => {
            // console.log(err)
            message.error('获取群聊失败')
        })
    }, [beginConnect])

    useEffect(() => {
        if(!socket) return

        getGroupList()
        
        function newMessage(_: any, gid: string) {
            receivedNewMessage(gid)
        }
        function deleteGroup(gid: string) {
            removeGroup(gid)
        }
        function error(err: SocketError) {
            console.log(err)
            message.error(err.data.msg)
        }
        socket.on('new message', newMessage)
        socket.on('dissolve group', deleteGroup)
        socket.on('error', error)
        return () => {
            socket.off('new message', newMessage)
            socket.off('dissolve group', deleteGroup)
            socket.off('error', error)
        }
    }, [getGroupList, socket, removeGroup, receivedNewMessage])

    useEffect(() => {
        if (current) {
            navigate('/groups/' + current)
        } else {
            if(window.location.pathname !== '/groups') {
                navigate('/groups')   
            }   
        }
    }, [current, navigate])


    const copyGroupID = () => {
        window.navigator.clipboard.writeText(operating!.id.toString()).then(() => {
            message.success('复制成功')
        }).catch(err => {
            message.error('复制失败')
        })
    }

    const lookMembers = () => {
        setDrawerVis(true)
    }

    const dissolveGroup = () => {
        Modal.confirm({
            title: '确认解散该群？',
            maskClosable: true,
            onOk: () => {
                socket.emit('dissolve group', operating?.gid, (err: any) => {
                    console.log(err)
                    if(!err) {
                        message.success('解散群聊成功')
                    } else {
                        message.error('解散群聊失败')
                    }
                })
            },
        })
    }


    const groupContextMenu = useCallback((e: React.MouseEvent, group: Group) => {
        e.preventDefault();

        // menuRef.current.style.left = e.pageX + 'px'
        // menuRef.current.style.top = e.pageY + 'px'
        // setMenuShow(true)
        setOperating(group)
    }, [])



    return (
        <div className='group-list' id='group-list'>
            <ContextMenu items={[
                { key: 0, label: '复制群id', onClick: copyGroupID },
                { type: 'divider' },
                { key: 1, label: '查看群成员', onClick: lookMembers },
                { key: 2, label: '解散该群', onClick: dissolveGroup }
            ]}>
                <List
                    dataSource={groups}
                    renderItem={item => (
                        <ContextMenu.Item key={item.gid}>
                            <List.Item
                                className={`group-item ${current === item.gid && 'active'}`}
                                onClick={() => setCurrent(item.gid)}
                                onContextMenu={(e) => groupContextMenu(e, item)}
                            >
                                <List.Item.Meta
                                    avatar={<Image src={item.avatar} className='avatar' />}
                                    title={item.name}
                                />
                                <div className='badge'>
                                    <Badge dot={!item.read} />
                                </div>
                            </List.Item>
                        </ContextMenu.Item>
                    )}
                />
            </ContextMenu>

            <Drawer title="所有群成员" placement="right" visible={drawerVis} onClose={() => setDrawerVis(false)} className='drawer'>
                <GroupMember gid={operating?.gid} />
            </Drawer>
            {/* {menu} */}
        </div>
    )
}

export default GroupsList