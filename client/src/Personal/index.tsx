import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { IdcardOutlined } from '@ant-design/icons';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import type {MenuProps} from 'antd'

import Profile from './profile';
import Account from './account';
import Inform from './inform';
import WebSites from './websites'
import Header from '../components/Header';
import { FileEditOutlined, NotificationOutlined, DoExerciseOutlined, LinkToNewBlankOutlined, WebSiteOutlined } from '../components/Icons'
// import logo from '../assert/images/logo.png'

import './scss/index.scss'



interface OutLinkProps {
    children: React.ReactNode
    href: string
}

const { Content, Sider } = Layout;


const OutLink: React.FC<OutLinkProps> = ({ children, href }) => (
    <a href={href} target='_blank' className='out-link' rel='noreferrer'>
        <span>{children}</span>
        <LinkToNewBlankOutlined />
    </a>
)

const Personal: React.FC = () => {
    const [select, setSelect] = useState('profile')

    const location = useLocation()

    useEffect(() => {
        let s = location.pathname.split('/')[2]
        setSelect(s)
    }, [location])

    
    const items: MenuProps['items'] = [
        { 
            key: 'profile', 
            label: <Link to='/person/profile'>个人资料</Link>, 
            icon: <IdcardOutlined />
        },
        { 
            key: 'account', 
            label: <Link to='/person/account'>账号安全</Link>, 
            icon: <FileEditOutlined /> 
        },
        { 
            key: 'notification', 
            label: <Link to='/person/notification'>通知管理</Link>, 
            icon: <NotificationOutlined /> 
        },
        { type: 'divider' },
        { 
            key: 'websites', 
            label: <Link to='/person/websites'>各种网站</Link>, 
            icon: <WebSiteOutlined /> 
        },
        { 
            key: 4, 
            label: <OutLink href='https://leetcode.cn/problemset/all/'>我要刷题（力扣）</OutLink>, 
            icon: <DoExerciseOutlined /> 
        }
    ]

    return (
        <Layout className='personal layout'>
            <Header>
                <Link to='/groups'>聊天</Link>
            </Header>
            <Layout className='body layout'>
                <Sider breakpoint='md'>
                    <Menu
                        mode='inline'
                        style={{ height: '100%' }}
                        items={items}
                        selectedKeys={[select]}
                    />
                </Sider>
                <Content className='content'>
                    <Routes>
                        <Route path='/profile' element={<Profile />} />
                        <Route path='/account' element={<Account />} />
                        <Route path='/notification' element={<Inform />} />
                        <Route path='/websites' element={<WebSites />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    );
};

export default Personal;