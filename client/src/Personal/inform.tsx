import axios from 'axios'
import store from 'store'
import React, { useCallback, useEffect, useState } from 'react'
import { Card, Switch, Tooltip } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons'
import type { SwitchProps } from 'antd'

import { message } from '../pkg'

import './scss/inform.scss'


const Inform: React.FC = () => {
    const [sendInform, setSendInform] = useState(false)
    const [receive, setReceive] = useState(true)
    const [text, setText] = useState('')
    const [disable, setDisable] = useState(false)

    const changeReceiveSystem = useCallback((checked?: boolean, event?: MouseEvent) => {
        axios.post('/auth/messageSystem', {able: checked})
            .then(({data: {able}}) => {
                setReceive(able)
            })
            .catch(err => {
                // console.log(err)
            })
    }, [])

    const sendChangeReq = useCallback((checked?: boolean) => {
        axios.post('/auth/messageAlert', {able: checked})
            .then(({data: {able}}) => {
                setSendInform(able)
                store.set('userInfo', {
                    ...store.get('userInfo'),
                    messageAlertable: able
                })
            })
            .catch(err => {
                // console.log(err)
                message.error('设置失败')
            })
    }, [])

    const changeSend: NonNullable<SwitchProps['onChange']> = (checked, event) => {
        new Promise<boolean>((resolve, reject) => {
            if(Notification.permission === 'granted') {
                resolve(checked)
            } else if(checked && Notification.permission !== "denied") {
                setDisable(true)
                Notification.requestPermission()
                    .then((permission) => {
                        if (permission === "granted") resolve(checked)
                        else reject('未允许浏览器通知')
                    })
                    .catch(err => {
                        // console.log(err)
                        reject('获取浏览器通知权限失败')
                    })
            } else reject('浏览器通知已禁止，请检查您的网站设置')
        }).then(sendChangeReq).catch((err) => {
            message.warn(err)
        }).then(() => {
            setDisable(false)
        })
    }

    useEffect(() => {
        if (!("Notification" in window)) {
            setText('你的浏览器不支持桌面通知')
            setDisable(true)
            return
        }
        sendChangeReq()
        changeReceiveSystem()
    }, [sendChangeReq, changeReceiveSystem])

    return (
        <Card className='card inform'>
            <div className='item'>
                <span>
                    允许浏览器发送通知到桌面
                    <Tooltip title={text} overlayClassName='tool-tip'>
                        <ExclamationCircleOutlined className='tip' />
                    </Tooltip>
                </span>
                <Switch checked={sendInform} onChange={changeSend} disabled={disable} />
            </div>
            <div className='item'>
                <span>接收系统通知</span>
                <Switch checked={receive} onChange={changeReceiveSystem} />
            </div>
        </Card>
    )
}

export default Inform