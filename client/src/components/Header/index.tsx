import React, { useContext, useState, useEffect } from 'react'
import { Space, Dropdown, Menu, Switch } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import {Link, useNavigate} from 'react-router-dom'
import store from 'store'
import axios from 'axios'

import { Context } from '../../App'
import useUserInfo from '../../hooks/useUserInfo'
import Image from '../Image'
import { SunLightOutLined, MoonNightOutlined, NotificationOutlined, ManageOutlined } from '../Icons'
import { message } from '../../pkg'

import logo from '../../assert/images/logo.png'
import './index.scss'




type UserRole = 'topAdmin' | 'seniorAdmin' | 'admin' | 'normal'
enum UserRoleWeight {
    normal,
    admin,
    seniorAdmin,
    topAdmin
}

const Header: React.FC<{
    children?: React.ReactNode
}> = ({ children }) => {
    const [visible, setVisible] = useState(false)
    const [role, setRole] = useState<UserRole>('normal')

    const userInfo = useUserInfo()

    const { changeTheme, theme } = useContext(Context)
    const navigate = useNavigate()

    useEffect(() => {
        axios.get('/auth/role').then(({data}) => {
            setRole(data)
        }).catch(err => {
            message.error('获取用户角色失败')
        })
    }, [])

    const handleVisibleChange = (vis: boolean) => {
        setVisible(vis);
    };


    const toPersonalCenter = () => {
        navigate('/person')
    }

    const logout = () => {
        store.remove('token')
        store.remove('userInfo')
        navigate('/')
    }

    const avatar = (
        <Image className='user-avatar' src={userInfo.avatar} />
    )

    const preson = (
        <Space className='person' size={30}>
            {avatar}
            {userInfo.username}
        </Space>
    )

    const menu = (
        <Menu
            items={[
                { key: 0, label: preson },
                { type: 'divider' },
                { key: 1, label: '个人中心', icon: <UserOutlined />, onClick: toPersonalCenter },
                {
                    key: 2, label: (
                        <div className='theme'>
                            {
                                theme === 'dark'
                                    ? <MoonNightOutlined className='ant-dropdown-menu-item-icon' />
                                    : <SunLightOutLined className='ant-dropdown-menu-item-icon' />
                            }
                            <div>
                                <span>Dark theme</span>
                                <Switch defaultChecked={theme === 'dark'} onChange={changeTheme} />
                            </div>
                        </div>

                    )
                },
                {key: 3, label: '退出登录', icon: <LogoutOutlined />, onClick: logout}
            ]}
        />
    )

    return (
        <div className='header'>
            <div>
                <img className='logo' src={logo} />
                {children}
            </div>
            <Space direction='horizontal'>
                {
                    UserRoleWeight[role] > UserRoleWeight.normal && (
                        <Link to='/admin'>
                            <ManageOutlined className='header-icons' />
                        </Link>
                    )
                }
                <NotificationOutlined className='header-icons' />
                <Dropdown trigger={['click']} overlay={menu} placement='bottomRight' onVisibleChange={handleVisibleChange} visible={visible}>
                    {avatar}
                </Dropdown>
            </Space>
        </div>
    )
}

export default Header