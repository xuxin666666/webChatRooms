import React, { useEffect, useRef, useState } from 'react'
import { Button, Input, Modal, Upload } from 'antd'
import { PictureOutlined } from '@ant-design/icons'
import {useParams} from 'react-router-dom'
import axios from 'axios'
import type {UploadProps} from 'antd'

import { useUserInfo } from '../hooks'
import { message } from '../pkg';
import {States} from './container/groupDetailContainer'
import Img from '../components/Image'

import './scss/groupDetail.scss'



type Type = 'text' | 'image'

interface MessageProps {
    avatar: string
    username: string
    text: string
    isRight: boolean
    type: Type
    width?: number
    height?: number
}
interface MessageData extends MessageProps {
    create_time: number
    uid: number
}

const Message: React.FC<MessageProps> = ({ avatar, username, text, isRight, type, width, height }) => {
    if (width && height) {
        let max = Math.max(width, height)
        width = width / max * 100
        height = height / max * 100
    }

    return (
        <div className={`message ${isRight ? 'right' : 'left'}`}>
            <Img className='avatar' src={avatar} />
            <div className='side'>
                <span className='username'>{!isRight ? username : ' '}</span>
                <div className={`msg ${isRight ? 'right' : 'left'}`}>
                    {type === 'text' ? text : <Img className='image' src={text} preview width={width} height={height} />}
                </div>
            </div>
        </div>
    )
}

// const data = [
//     { text: '12fedsd3 qweqweqw ewqw wea sqed ffw cscde wwe eqweqwe', avatar: '123', username: '123', uid: '123', time: 1, type: 'text' },
//     { text: '/avatars/defaultUser.png', avatar: '123', username: '123', uid: '123', time: 2, type: 'image', width: 300, height: 500 },
//     { text: '123', avatar: '123', username: '123', uid: 100000002, time: 10, type: 'text' },
//     { text: '123', avatar: '123', username: '123', uid: '123', time: 11, type: 'image', width: 300, height: 300 },
//     { text: '123', avatar: '123', username: '123', uid: '123', time: 16, type: 'text' }
// ]

const GroupDetail: React.FC<{
    socket: States['socket']
}> = ({ socket }) => {
    const userInfo = useUserInfo()
    const params = useParams()
    const {group: gid} = params

    const [data, setData] = useState<MessageData[]>([])
    const [content, setContent] = useState('')
    const [disabled, setDisabled] = useState(false)

    const show = useRef<HTMLDivElement>(null)       // ????????????dom?????????????????????????????????????????????????????????????????????
    const input = useRef<HTMLInputElement>(null)      // ?????????
    const button = useRef<HTMLButtonElement>(null)     // ??????????????????
    const prevHeight = useRef<number>(0)


    useEffect(() => {
        if(gid) {
            axios.get('/group/getMessages', {params: {gid}}).then(({data}) => {
                // {width, height, text, avatar, username, uid, create_time, type}[]
                setData(data)
            }).catch(err => {
                message.error('??????????????????')
            })
        }
    }, [gid])

    useEffect(() => {
        prevHeight.current = show.current!.scrollHeight
        input.current?.focus()
    }, [])

    // ????????????????????????????????????????????????????????????????????????
    useEffect(() => {
        let totalHeight = show.current!.scrollHeight,
            height = show.current!.clientHeight,
            top = show.current!.scrollTop

        if (top + height + 15 > prevHeight.current) {
            show.current?.scrollTo({ top: totalHeight - height, behavior: 'smooth' })
        }

        prevHeight.current = totalHeight

    }, [data])

    // ??????png???jpg???jpeg???gif?????????20M
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const allowTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
        if (!allowTypes.includes(file.type)) {
            message.error('Only allow a png/jpg/jpeg/gif file!')
            return false
        }

        const isLt3M = file.size / 1024 / 1024 < 20;
        if (!isLt3M) {
            message.error('Image must be smaller than 20MB!');
            return false
        }

        return true
    }

    const upload: UploadProps['customRequest'] = (file) => {
        socket.emit('new message', {gid, text: file.file, type: 'image'})
    }

    useEffect(() => {
        if(!socket) return

        function newMessage(values: MessageData, groupId: string) {
            // ??????????????????????????????????????????????????????????????????????????????
            //      A, B???????????????1, 2??????A?????????1???B?????????2?????????????????????
            // ??????????????????
            if(groupId === gid) {
                setData(prev => [
                    ...prev,
                    values
                ])
            }
        }
        function deleteGroup(groupId: string) {
            if(groupId === gid) {
                Modal.warning({
                    title: '??????????????????',
                    maskClosable: true
                })
            }
        }
        function error() {
            setDisabled(false)
        }
        socket.on('new message', newMessage)
        socket.on('dissolve group', deleteGroup)
        socket.on('error', error)

        return () => {
            socket.off('new message', newMessage)
            socket.off('dissolve group', deleteGroup)
            socket.off('error', error)
        }
    }, [socket, gid])

    const sendMessage = () => {
        let con = content.trim()
        if (con) {
            setDisabled(true)
            socket.emit('new message', {text: con, type: 'text', gid}, () => {
                setContent('')
                setDisabled(false)
            })
        } else setContent('')
        input.current?.focus()
    }

    useEffect(() => {
        function ctrlEnter(e: KeyboardEvent) {
            if(e.key === 'Enter' && e.ctrlKey) {
                button.current?.click()
            }
        }
        window.addEventListener('keydown', ctrlEnter)

        return () => {
            window.removeEventListener('keydown', ctrlEnter)
        }
    }, [])

    return (
        <div className='group-detail'>
            <div className='detail-container'>
                <div className='show' ref={show}>
                    {data.map(item => (
                        <Message
                            key={item.create_time}
                            avatar={item.avatar}
                            username={item.username}
                            text={item.text}
                            isRight={item.uid === userInfo.uid}
                            type={item.type}
                            width={item.width}
                            height={item.height}
                        />
                    ))}
                </div>
            </div>
            <div className='send'>
                <div className='function'>
                    <Upload
                        beforeUpload={beforeUpload}
                        customRequest={upload}
                        showUploadList={false}
                        accept='.png, .jpg, .jpeg, .gif'
                        className='upload'
                    >
                        <PictureOutlined className='icon' />
                    </Upload>
                </div>
                <div className='main'>
                    <Input.TextArea
                        bordered={false}
                        maxLength={1000}
                        autoSize={{ minRows: 4, maxRows: 4 }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        ref={input}
                    />
                </div>
                <div className='last'>
                    <Button className='submit' onClick={sendMessage} ref={button} disabled={disabled}>
                        ??????
                    </Button>
                </div>
            </div>
        </div>
    )
}

export default GroupDetail