import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd';
import { TeamOutlined, UserOutlined, PictureOutlined } from '@ant-design/icons';
import { Link, Route, Routes, useLocation } from 'react-router-dom';
import type { MenuProps } from 'antd'

import Header from '../components/Header';
import Person from './person';

import './scss/index.scss'



const { Content, Sider } = Layout;



const Admin: React.FC = () => {
    const [select, setSelect] = useState('person')

    const location = useLocation()

    useEffect(() => {
        let s = location.pathname.split('/')[2]
        setSelect(s)
    }, [location])


    const items: MenuProps['items'] = [
        {
            key: 'person',
            label: <Link to='/admin/person'>用户管理</Link>,
            icon: <UserOutlined />
        },
        {
            key: 'group',
            label: <Link to='/admin/group'>群管理</Link>,
            icon: <TeamOutlined />
        },
        {
            key: 'picture',
            label: <Link to='/admin/picture'>图片管理</Link>,
            icon: <PictureOutlined />
        }
    ]

    return (
        <Layout className='admin layout'>
            <Header>
                <Link to='/groups'>聊天</Link>
            </Header>
            <Layout className='body layout'>
                <Sider breakpoint='md' >
                    <Menu
                        mode='inline'
                        style={{ height: '100%' }}
                        items={items}
                        selectedKeys={[select]}
                    />
                </Sider>
                <Content className='content'>
                    <Routes>
                        <Route path='/person' element={<Person />} />
                        <Route path='/group' element={<div />} />
                        <Route path='/picture' element={<div />} />
                    </Routes>
                </Content>
            </Layout>
        </Layout>
    )
}

export default Admin