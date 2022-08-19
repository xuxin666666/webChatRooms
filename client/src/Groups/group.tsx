import React, { useEffect } from 'react'
import { Route, Routes } from 'react-router-dom'
import Io from 'socket.io-client'
import store from 'store'

import Header from '../components/Header'
import GroupDetailContainer from './container/groupDetailContainer'
import GroupListContainer from './container/groupListContainer'
import CreateGroupContainer from './container/createGroupContainer'
import JoinGroupContainer  from './container/joinGroupContainer'
import { Dispatches } from './container/groupContainer'
import { ioUrl } from '../config/config'

import './scss/index.scss'



const GroupMain: React.FC<{
    setSocket: Dispatches['setSocket']
}> = ({ setSocket }) => {

    useEffect(() => {
        const socket = Io(ioUrl, {
            auth: {
                token: store.get('token')
            }
        })
        setSocket(socket)
    }, [setSocket])


    return (
        <div className='groups'>
            <Header>
                <CreateGroupContainer />
                <JoinGroupContainer />
            </Header>
            <div className='container'>
                <div className='content'>
                    <div className='list'>
                        <GroupListContainer />
                    </div>
                    <Routes>
                        <Route path=':group' element={(
                            <div className='detail'>
                                <GroupDetailContainer />
                            </div>
                        )} />
                    </Routes>
                </div>
            </div>
        </div>
    )
}

export default GroupMain