import React, { lazy, Suspense, createContext, useEffect, useRef, useState } from 'react'
import { Spin, ConfigProvider } from 'antd'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import axios from 'axios'
import store from 'store'
import zhCN from 'antd/es/locale/zh_CN';

import { useTheme } from '../hooks'
import { message } from '../pkg';
import Portals from '../components/Portals'
import ScrollBar from './scrollBar'

import './scss/index.scss'

const Auth = lazy(() => import('../Auth'))
const Home = lazy(() => import('./home'))


const Context = createContext({
    theme: 'dark',
    changeTheme: () => { }
})

const App = () => {
    const [theme, changeTheme] = useTheme()

    useEffect(() => {
        axios.get('/auth/auto').then(({ data: { avatar, username, uid, email, messageAlertable } }) => {
            store.set('userInfo', { username, avatar, uid, email, messageAlertable })
            message.success('登录成功', 1)
            if (window.location.pathname === '/') {
                window.location.pathname = '/groups'
            }
        }).catch((err) => {
            // console.log(err)
        })
    }, [])

    return (
        <Context.Provider value={{ changeTheme, theme }}>
            <ConfigProvider locale={zhCN}>
                <div className='app' >
                    <ScrollBar />
                    <BrowserRouter>
                        <Suspense fallback={
                            <Portals>
                                <Spin size='large'></Spin>
                            </Portals>
                        }>
                            <Routes>
                                <Route path='/' element={<Auth />} />
                                <Route path='*' element={<Home />} />
                            </Routes>
                        </Suspense>
                    </BrowserRouter>
                </div>
            </ConfigProvider>
        </Context.Provider>
    )
}

export default App
export {
    Context
}