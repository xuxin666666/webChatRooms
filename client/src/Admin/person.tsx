import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Button, Input, Modal, Tag, InputNumber, Pagination } from 'antd'
import axios from 'axios';

import FilterContainer from '../components/FilterContainer'
import CheckboxGroup from '../components/CheckBoxGroup';
import RadioGroup from '../components/RadioGroup';
import Image from '../components/Image';
import { useCountDown } from '../hooks';
import { message, timeCountDown } from '../pkg';
import type { CheckboxGroupProps } from '../components/CheckBoxGroup'

import './scss/person.scss'




type UserRole = 'topAdmin' | 'seniorAdmin' | 'admin' | 'normal'
enum UserRoleWeight {
    normal,
    admin,
    seniorAdmin,
    topAdmin
}
const roles: UserRole[] = ['normal', 'admin', 'seniorAdmin', 'topAdmin']

interface UserInfo {
    avatar: string
    blocked_time: number
    create_time: number
    email: string
    last_online: number
    role: UserRole
    uid: number
    username: string
}
interface UserCardProps extends UserInfo {
    selfRole: UserRole
}
function assertIsNode(e: any): asserts e is HTMLElement { }


const roleOptions = [
    { label: '顶级管理员', value: 'topAdmin' },
    { label: '超级管理员', value: 'seniorAdmin' },
    { label: '普通管理员', value: 'admin' },
    { label: '普通用户', value: 'normal' }
]
const blockOptions = [
    { label: '未封号', value: 0 },
    { label: '1天内', value: 1 },
    { label: '1周内', value: 7 },
    { label: '1月内', value: 30 },
    { label: '3月内', value: 90 },
    { label: '1年内', value: 365 },
    { label: '1年外', value: -1 }
]
const orderOptions = [
    { label: '由早到晚', value: 1 },
    { label: '由晚到早', value: -1 },
]

const roleTags = {
    topAdmin: <Tag color='gold' className="role">顶级管理员</Tag>,
    seniorAdmin: <Tag color='purple' className="role">高级管理员</Tag>,
    admin: <Tag color='blue' className="role">管理员</Tag>,
    normal: <Tag color='green' className="role">普通用户</Tag>
}


const UserCard: React.FC<UserCardProps> = (props) => {
    const [timeRemain, setTimeRemain] = useCountDown(
        props.blocked_time === 0 ? 0 : (props.blocked_time - Date.now())
    )
    const [role, setRole] = useState(props.role)
    const [avatar, setAvatar] = useState(props.avatar)
    const [vis, setVis] = useState(false)

    const bTime = useRef({
        year: 0,
        month: 0,
        day: 0,
        hour: 0,
        minute: 0,
    })

    const changeRole = (change: 1 | -1) => {
        const targetRole = roles[UserRoleWeight[role] + change]

        axios.post('/auth/changeRole', {
            uid: props.uid,
            role: targetRole
        }).then(() => {
            setRole(targetRole)
        }).catch(err => {
            // console.log(err);
            change === 1 ? message.error('晋升失败') : message.error('降职失败')
        })
    }

    const changeBlockTime = (time: number) => {
        if (time === 0) {
            axios.post('/auth/unBlockUser', { uid: props.uid }).then(() => {
                setTimeRemain(0)
            }).catch(err => {
                message.error('解封失败')
            })
        } else {
            axios.post('/auth/blockUser', { uid: props.uid, time }).then(() => {
                setTimeRemain(time)
                setVis(false)
            }).catch(err => {
                message.error('封号失败')
            })
        }
    }

    const optionsBlock: React.MouseEventHandler = (e) => {
        assertIsNode(e.target)
        if (e.target.dataset && e.target.dataset.value) {
            changeBlockTime(parseInt(e.target.dataset.value) * 1000)
        }
    }

    const customBlock = () => {
        let time = 60 * bTime.current.minute +
            3600 * bTime.current.hour +
            86400 * bTime.current.day +
            30 * 86400 * bTime.current.month +
            365 * 86400 * bTime.current.year

        changeBlockTime(time * 1000)
    }

    const deleteAvatar = () => {
        axios.delete('/auth/avatar', { data: { uid: props.uid } }).then(({ data }) => {
            setAvatar(data)
        }).catch(err => {
            message.error('删除头像失败')
        })
    }

    return (
        <div className='userCard'>
            <div className="left">
                <Image src={avatar} className='avatar' preview />
                <span className="id">{props.uid}</span>
                {roleTags[role]}
            </div>
            <div className="right">
                <div className="top">
                    <div className="name">
                        用户名：
                        <span>{props.username}</span>
                    </div>
                    <div className="email">
                        邮箱：
                        <span>{props.email}</span>
                    </div>
                    {Boolean(timeRemain) && (
                        <div className="blockTime">
                            剩余解封时间：
                            <span>{timeCountDown(timeRemain)}</span>
                        </div>
                    )}
                    <div className="createTime">
                        账号创建时间：
                        <span>{new Date(props.create_time).toLocaleDateString()}</span>
                    </div>
                    <div className="lastOnline">
                        上次登录时间：
                        <span>{new Date(props.last_online).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="bottom">
                    {UserRoleWeight[props.selfRole] > UserRoleWeight[role] + 1 && (
                        <>
                            <button className='danger' onClick={() => changeRole(1)}>晋升</button>
                        </>
                    )}
                    {UserRoleWeight[props.selfRole] > UserRoleWeight[role] && (
                        <>
                            {role !== 'normal' && (
                                <button className='danger' onClick={() => changeRole(-1)}>降职</button>
                            )}
                            {timeRemain ? (
                                <button className="danger" onClick={() => changeBlockTime(0)}>解封</button>
                            ) : (
                                <button className="danger" onClick={() => setVis(true)}>封号</button>
                            )}
                            <button className='danger' onClick={deleteAvatar}>删除头像</button>
                        </>
                    )}
                </div>
            </div>
            <Modal
                title='选择封号时长'
                visible={vis}
                onCancel={() => setVis(false)}
                footer={false}
            >
                <div className='userCard-selectTime'>
                    <div className='times' onClick={optionsBlock}>
                        <span data-value={3600}>1小时</span>
                        <span data-value={12 * 3600}>12小时</span>
                        <span data-value={24 * 3600}>1天</span>
                        <span data-value={7 * 86400}>1周</span>
                        <span data-value={30 * 86400}>1个月</span>
                        <span data-value={180 * 86400}>6个月</span>
                        <span data-value={365 * 86400}>1年</span>
                        <span data-value={3 * 365 * 86400}>3年</span>
                        <span data-value={10 * 365 * 86400}>10年</span>
                    </div>
                    <div className='custom'>
                        自定义：
                        <div>
                            <InputNumber
                                className='input'
                                min={0}
                                max={100}
                                defaultValue={0}
                                parser={val => parseInt(val!.replace(/\D/g, ''))}
                                onChange={(num: number) => bTime.current.year = num}
                            />
                            年
                            <InputNumber
                                className='input'
                                min={0}
                                max={12}
                                defaultValue={0}
                                parser={val => parseInt(val!.replace(/\D/g, ''))}
                                onChange={(num: number) => bTime.current.month = num}
                            />
                            月
                            <InputNumber
                                className='input'
                                min={0}
                                max={30}
                                defaultValue={0}
                                parser={val => parseInt(val!.replace(/\D/g, ''))}
                                onChange={(num: number) => bTime.current.day = num}
                            />
                            日
                            <br />
                            <InputNumber
                                className='input'
                                min={0}
                                max={24}
                                defaultValue={0}
                                parser={val => parseInt(val!.replace(/\D/g, ''))}
                                onChange={(num: number) => bTime.current.hour = num}
                            />
                            时
                            <InputNumber
                                className='input'
                                min={0}
                                max={60}
                                defaultValue={0}
                                parser={val => parseInt(val!.replace(/\D/g, ''))}
                                onChange={(num: number) => bTime.current.minute = num}
                            />
                            分
                            <Button className='input' onClick={customBlock}>确认</Button>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    )
}

const Person: React.FC = () => {
    const filterOptions = useRef({
        role: ['topAdmin', 'seniorAdmin', 'admin', 'normal'],
        block: [0, 1, 7, 30, 90, 365, -1],
        order: 1
    })

    const [searchLoading, setSearchLoading] = useState(false)
    const [page, setPage] = useState(1)
    const [userRole, setUserRole] = useState<UserRole>('normal')
    const [users, setUsers] = useState<UserInfo[]>([])
    const [total, setTotal] = useState(0)

    useEffect(() => {
        axios.get('/auth/role').then(({ data }) => {
            setUserRole(data)
        }).catch(err => {
            // console.log(err);
            message.error('获取用户角色失败')
        })
    }, [])

    const roleChange: CheckboxGroupProps['onChange'] = (list) => {
        filterOptions.current.role = list as string[]
    }

    const blockChange: CheckboxGroupProps['onChange'] = (list) => {
        filterOptions.current.block = list as number[]
    }

    const orderChange = (val: string | number) => {
        filterOptions.current.order = val as number
    }

    const filterClick = useCallback((page: number = 1) => {
        setSearchLoading(true)
        axios.post('/auth/filter', { 
            ...filterOptions.current, 
            page: page - 1 
        }).then(({ data: { users, total } }) => {
            // console.log(data);
            setUsers(users)
            setTotal(total)
            setPage(page)
        }).catch(err => {
            // console.log(err);
            message.error('筛选用户失败')
        }).then(() => {
            setSearchLoading(false)
        })
    }, [])

    const searchByUID = (val: string) => {
        val = val.trim()

        if (!val) return
        if (!/^[0-9]{9}$/.test(val)) {
            message.warn('请输入正确的用户id')
            return
        }
        setSearchLoading(true)
        axios.get(`/auth/search?uid=${val}`).then(({ data }) => {
            setUsers([data])
        }).catch(err => {
            // console.log(err);
            message.error('搜索用户失败')
        }).then(() => {
            setSearchLoading(false)
        })
    }

    return (
        <div className='adminPerson'>
            <FilterContainer>
                <CheckboxGroup
                    checkAllName='角色'
                    options={roleOptions}
                    defaultCheckedList={filterOptions.current.role}
                    onChange={roleChange}
                />
                <CheckboxGroup
                    checkAllName='封号时长'
                    options={blockOptions}
                    defaultCheckedList={filterOptions.current.block}
                    onChange={blockChange}
                />
                <RadioGroup
                    name='注册时间'
                    defaultChecked={filterOptions.current.order}
                    options={orderOptions}
                    onChange={orderChange}
                />
                <Input.Search
                    className='inputSearch'
                    placeholder='根据用户id来搜索'
                    allowClear
                    onSearch={searchByUID}
                    loading={searchLoading}
                />
                <div className='lineBtn'>
                    <Button className='btn' onClick={() => filterClick()} loading={searchLoading}>筛选</Button>
                </div>
            </FilterContainer>

            <div className={`${users.length > 1 ? 'contentGrid' : 'contentFlex'}`}>
                {users.map((user) => (
                    <UserCard {...user} selfRole={userRole} key={Math.random()} />
                ))}
                {/* {users.length % 2 !== 0 && (<div className='userCard' style={{ visibility: 'hidden' }}></div>)} */}
            </div>

            <div className='pgi'>
                {
                    users.length > 1 && (
                        <Pagination
                            className='pagination'
                            total={total}
                            current={page}
                            showSizeChanger={false}
                            onChange={(page) => filterClick(page)}
                        />
                    )
                }
            </div>
        </div>
    )
}

export default Person