import { Input, Upload } from 'antd'
import axios from 'axios'
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { EditOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import type { InputRef, UploadProps } from 'antd'

import Image from '../components/Image'
import { message } from '../pkg'
import { SubmitOutLined } from '../components/Icons'
import { useUserInfo } from '../hooks'
import type { Dispatches } from './container/groupInfoContainer'

import './scss/groupInfo.scss'


type GroupRole = 'owner' | 'admin' | 'normal'
enum GroupRolesWeight {
    normal,
    admin,
    owner
}

interface Info {
    avatar: string
    owner: number
    ownerName: string
    name: string
    description: string
}


const Edit: React.FC<{
    onEdit?: (val: any) => Promise<void>
    children: React.ReactNode
    title?: undefined
    editable?: boolean
} | {
    onEdit?: (val: any) => Promise<void>
    children: string | number | undefined
    title: React.ReactNode
    editable?: boolean
}> = ({ onEdit, children, title, editable = true }) => {
    const [editing, setEditing] = useState(false)
    const [val, setVal] = useState('')

    const inputRef = useRef<InputRef>(null)

    const onedit = () => {
        setEditing(true)
        setVal(children as string)
    }

    const oneditfinish = () => {
        if (typeof onEdit !== 'function') setEditing(false)
        else {
            onEdit(val).then(() => {
                setEditing(false)
            }).catch()
        }
    }

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus({cursor: 'end'})
        }
    }, [editing])

    return (
        <div id={`groupInfoEdit-${Date.now().toString().slice(-4)}`}>
            {
                title ? (
                    <>
                        <div className='title'>
                            {title}：
                            {editable && (editing ? (
                                <SubmitOutLined className='edit' onClick={oneditfinish} />
                            ) : (
                                <EditOutlined className='edit' onClick={onedit} />
                            ))}
                        </div>
                        <div className='content'>
                            {editing ? (
                                <Input.TextArea maxLength={300} autoSize={{maxRows: 6}} className='input' value={val} ref={inputRef} onChange={e => setVal(e.target.value)} />
                            ) : children ? children : '暂无'}
                        </div>
                    </>
                ) : (
                    <div className='content'>
                        {children}
                    </div>
                )
            }
        </div>
    )
}


const GroupInfo: React.FC<{
    gid?: string
    changeGroupInfo: Dispatches['changeGroupInfo']
}> = ({ gid, changeGroupInfo }) => {
    const userInfo = useUserInfo()

    const [userRole, setUserRole] = useState<GroupRole>('normal')
    const [groupInfo, setGroupInfo] = useState<Info>()

    const editable = GroupRolesWeight[userRole] >= GroupRolesWeight.admin

    useEffect(() => {
        axios.get('/group', { params: { id: gid } }).then(({ data }) => {
            // console.log(data);
            setGroupInfo(data)
        }).catch(err => {
            message.error('获取群聊信息失败')
        })
    }, [gid])

    useEffect(() => {
        axios.get('/group/members', { params: { gid } }).then(({ data }) => {
            // {username, uid, avatar, block, role}[]
            for (let i = 0, len = data.length; i < len; i++) {
                if (data[i].uid === userInfo.uid) {
                    setUserRole(data[i].role)
                    break
                }
            }
        }).catch(err => {
            // console.log(err)
            message.error('获取群身份失败')
        })
    }, [gid, userInfo.uid])


    // 限制png、jpg、jpeg、gif文件，3M
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const allowTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
        if (!allowTypes.includes(file.type)) {
            message.error('Only allow a png/jpg/jpeg/gif file!')
            return false
        }

        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
            message.error('Image must be smaller than 3MB!');
            return false
        }

        return true
    }

    const upload: UploadProps['customRequest'] = (file) => {
        let param = new FormData()
        param.append('avatar', file.file)
        param.append('gid', gid!)

        axios.post('/group/avatar', param)
            .then(({ data }) => {
                changeGroupInfo(gid!, {
                    avatar: data
                })
                setGroupInfo(prev => ({
                    ...prev!,
                    avatar: data
                }))
            })
            .catch(err => {
                // console.log(err)
                if (err.response && err.response.data) {
                    message.error(err.response.data.msg)
                }
                message.error('更换头像失败')
            })
    }

    const changeInfo = useCallback((type: string, value: any) => {
        return new Promise<void>((resolve, reject) => {
            axios.post('/group/changeInfo', {[type]: value, gid}).then(() => {
                if(type === 'name') {
                    changeGroupInfo(gid!, {name: value})
                }
                setGroupInfo(prev => ({...prev!, [type]: value}))
                resolve()
            }).catch(err => {
                // console.log(err);
                message.error('修改群信息失败')
                reject()
            })
        })
    }, [gid])

    return (
        <div className='groupInfo'>
            <Edit>
                <Image src={groupInfo?.avatar!} preview className='img' />
                {editable && (
                    <ImgCrop>
                        <Upload
                            accept='.png, .jpg, .jpeg, .gif'
                            showUploadList={false}
                            className='upload'
                            beforeUpload={beforeUpload}
                            customRequest={upload}
                        >
                            <EditOutlined className='edit' />
                        </Upload>
                    </ImgCrop>
                )}
            </Edit>
            <div className='description'>
                <Edit title='群聊名称' editable={editable} onEdit={val => changeInfo('name', val)}>
                    {groupInfo?.name}
                </Edit>
                <Edit title='群&emsp;&emsp;主' editable={false}>
                    {groupInfo?.ownerName}
                </Edit>
                <Edit title='群聊简介' editable={editable} onEdit={val => changeInfo('description', val)}>
                    {groupInfo?.description}
                </Edit>
            </div>
        </div>
    )
}

export default GroupInfo