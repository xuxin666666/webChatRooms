import React, { useContext, useState } from 'react'
import { Space, Dropdown, Menu, Switch } from 'antd'
import { UserOutlined, LogoutOutlined } from '@ant-design/icons'
import {useNavigate} from 'react-router-dom'
import store from 'store'

import { Context } from '../../App'
import useUserInfo from '../../hooks/useUserInfo'
import Image from '../Image'
import { SunLightOutLined, MoonNightOutlined, NotificationOutlined } from '../Icons'

import logo from '../../assert/images/logo.png'
import './index.scss'



const Header: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [visible, setVisible] = useState(false)

    const userInfo = useUserInfo()

    const { changeTheme, theme } = useContext(Context)
    const navigate = useNavigate()


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
                <NotificationOutlined className='header-icons' />
                <Dropdown trigger={['click']} overlay={menu} placement='bottomRight' onVisibleChange={handleVisibleChange} visible={visible}>
                    {avatar}
                </Dropdown>
            </Space>
        </div>
    )
}

export default Header