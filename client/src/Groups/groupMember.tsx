import React, { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Button, Space, Tag, Popconfirm, Modal } from 'antd'
import type { PopconfirmProps, MenuProps } from 'antd'

import ContextMenu from '../components/ContextMenu'
import Image from '../components/Image'
import { useUserInfo } from '../hooks'
import { message } from '../pkg';
import './scss/groupMember.scss'

type GroupRole = 'owner' | 'admin' | 'normal'
// enum GroupRoles {
//     owner = '群主',
//     admin = '管理员',
//     normal = '普通群员'
// }
enum GroupRolesWeight {
    normal,
    admin,
    owner
}
interface CustomPopconfirmProps {
    visible?: boolean
    title: string
    children: React.ReactNode
    onConfirm: PopconfirmProps['onConfirm']
    onCancle?: () => void
    onVisibleChange?: PopconfirmProps['onVisibleChange']
}
interface Member {
    username: string
    uid: number
    avatar: string
    block: number
    role: GroupRole
}


const CustomPopconfirm: React.FC<CustomPopconfirmProps> = ({visible, title, children, onCancle, onVisibleChange, onConfirm }) => (
    <Popconfirm
        overlayClassName='popover membersPopComfirm'
        title={title}
        visible={visible}
        placement='bottomRight'
        onConfirm={onConfirm}
        onVisibleChange={(vis) => {
            !vis && onCancle && onCancle()
            onVisibleChange && onVisibleChange(vis)
        }}
        okText="确定"
        cancelText="取消"
    >
        {children}
    </Popconfirm>
)

const GroupMember: React.FC<{gid?: string}> = ({ gid }) => {
    const userInfo = useUserInfo()

    const [userRole, setUserRole] = useState<GroupRole>('normal')
    const [members, setMembers] = useState<Member[]>([])
    const [btnShowIndex, setBtnShowIndex] = useState(-1)
    const [operating, setOperating] = useState<Member>() // 右键正在操作的群员

    useEffect(() => {
        axios.get('/group/members', { params: { gid } }).then(({ data }) => {
            // {username, uid, avatar, block, role}[]
            // console.log(data)
            data.sort((a: Member, b: Member) => GroupRolesWeight[b.role] - GroupRolesWeight[a.role])

            for (let i = 0, len = data.length; i < len; i++) {
                if (data[i].uid === userInfo.uid) {
                    setUserRole(data[i].role)
                    break
                }
            }
            setMembers(data)
        }).catch(err => {
            // console.log(err)
            message.error('获取群成员失败')
        })
    }, [gid, userInfo.uid])


    const setMemberRole = useCallback((status: GroupRole) => {
        console.log(status)

        // stopp && e.stopPropagation();

    }, [])

    const handleSetOwner = useCallback(() => {
        Modal.confirm({
            title: '确认晋升为群主？',
            maskClosable: true,
            onOk: () => setMemberRole('owner'),
        })
    }, [setMemberRole])

    const items: MenuProps['items'] = [
        {
            key: 0,
            label: '晋升为群主',
            onClick: handleSetOwner,
            disabled: userRole !== 'owner'
        },
        { type: 'divider' },
        {
            key: 1,
            label: '晋升为管理员',
            onClick: () => setMemberRole('admin'),
            disabled: !(userRole === 'owner' && operating?.role === 'normal')
        },
        {
            key: 2,
            label: '降职为普通成员',
            onClick: () => setMemberRole('normal'),
            disabled: !(userRole === 'owner' && operating?.role === 'admin')
        }
    ]

    const lookMembers = () => {
        // setDrawerVis(true)
    }

    const deleteMember = () => {

    }

    const cancleDelete = () => {
        setBtnShowIndex(-1)
    }

    return (
        <div className='groupMember'>
            <ContextMenu items={items}>
                {members.map((member, index) => (
                    <ContextMenu.Item key={member.uid} disabled={member.uid === userInfo.uid}>
                        <div className='member' onContextMenu={() => setOperating(member)}>
                            <Space>
                                <Image src={member.avatar} className='avatar' onClick={lookMembers} />
                                <span className='memberName' onClick={lookMembers}>{member.username}</span>
                                {
                                    member.role === 'owner' ? (
                                        <Tag color='gold'>群主</Tag>
                                    ) : (member.role === 'admin' ? (
                                        <Tag color='blue'>管理员</Tag>
                                    ) : '')
                                }
                                {
                                    Boolean(member.block) && (
                                        <Tag color='red'>封号中</Tag>
                                    )
                                }
                            </Space>
                            {
                                member.uid === userInfo.uid ? (
                                    <Tag color='#2db7f5'>我</Tag>
                                ) : GroupRolesWeight[userRole] > GroupRolesWeight[member.role] ? (
                                    <CustomPopconfirm title="确定移除该成员？" onConfirm={deleteMember} onCancle={cancleDelete}>
                                        <Button
                                            className='kickOut btn'
                                            danger
                                            size='small'
                                            style={btnShowIndex === index ? { display: 'block' } : {}}
                                            onClick={() => setBtnShowIndex(index)}
                                        >
                                            踢出群聊
                                        </Button>
                                    </CustomPopconfirm>
                                ) : ''
                            }

                        </div>
                    </ContextMenu.Item>
                ))}
            </ContextMenu>

        </div>
    )
}

export default GroupMember