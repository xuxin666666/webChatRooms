import React, { useEffect, useRef, useState } from 'react'
import { Space } from 'antd'

import Card3dWrap from '../components/Card3dWrap'
import RollRadio from '../components/RollRadio'
import Login from './login'
import Register from './register'

import './scss/index.scss'



type Direction = 'toLeft' | 'toRight'

const Auth = () => {
    const [turn, setTurn] = useState(false)
    const [direction, setDirection] = useState<Direction>('toRight')

    const timestamp = useRef(Date.now())


    const toggleClick = () => {
        // 节流
        if(Date.now() - timestamp.current < 300) return
        setTurn(prev => !prev)
        timestamp.current = Date.now()
    }


    useEffect(() => {
        let pagex = 0
        function setBrgin(e: MouseEvent) {
            pagex = e.pageX
        }
        function changeDirect(e: MouseEvent) {
            if (!pagex) return

            let x = e.pageX
            if (x - pagex > 30) setDirection('toRight')
            else if (pagex - x > 30) setDirection('toLeft')
            pagex = 0
        }
        document.addEventListener('mousedown', setBrgin)
        document.addEventListener('mouseup', changeDirect)

        return () => {
            document.removeEventListener('mousedown', setBrgin)
            document.removeEventListener('mouseup', changeDirect)
        }
    }, [])

    return (
        <div className='auth'>
            <div className='container'>
                <Space direction='vertical'>
                    <div className='l-and-r'>
                        <span onClick={() => setTurn(false)}>登录</span>
                        <span onClick={() => setTurn(true)}>注册</span>
                    </div>
                    <RollRadio roll={turn} onClick={toggleClick} width={70} />
                    <Card3dWrap wrap={turn} direction={direction}>
                        <Card3dWrap.Front>
                            <Login />
                        </Card3dWrap.Front>
                        <Card3dWrap.Back>
                            <Register toggleClick={toggleClick} />
                        </Card3dWrap.Back>
                    </Card3dWrap>
                </Space>

            </div>
        </div>
    )
}

export default Auth