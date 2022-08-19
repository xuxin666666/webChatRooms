import React, { useState } from 'react'
import axios from 'axios';
import store from 'store';
import { Form, Input, Button } from 'antd'
import { LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom'
import type { FormProps } from 'antd';

import { EmailOutlined } from '../components/Icons'
import { message } from '../pkg';


const useForm = Form.useForm

const Login: React.FC = () => {
    const navigate = useNavigate()

    const [form] = useForm()
    const [loading, setLoading] = useState(false)

    const onFinish: FormProps<{
        email: string
        password: string
    }>['onFinish'] = (value) => {
        setLoading(true)

        axios.post('/auth/login', value).then(({
            data: {
                token,
                username,
                avatar,
                email,
                messageAlertable,
                uid
            }
        }) => {
            store.set('token', token)
            store.set('userInfo', {
                username,
                avatar,
                email,
                messageAlertable,
                uid
            })
            navigate('/groups')
        }).catch(err => {
            console.log(err)
            let data = err.response.data
            if (data && data.msg) {
                message.error(data.msg)
            } else {
                message.error('登录失败')
            }
        }).catch(() => { }).then(() => {
            setLoading(false)
        })
    }

    const onFinishFailed: FormProps['onFinishFailed'] = (errInfo) => {
        let fields = errInfo.errorFields
        fields.forEach(({ name }) => {
            name.forEach(item => {
                form.setFieldsValue({
                    [item]: ''
                })
            })
            
        })
        let input = form.getFieldInstance(fields[0].name)
        input.focus()
    }

    return (
        <Form
            className='login form'
            form={form}
            scrollToFirstError
            initialValues={{
                email: '',
                password: ''
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
        >
            <Form.Item
                name='email'
                rules={[
                    { required: true, message: '请输入邮箱' },
                    { type: 'email', message: '邮箱不合法' }
                ]}
                validateTrigger='onBlur'
            >
                <Input prefix={<EmailOutlined className='icon' />} placeholder='邮箱' className='input' type='email' id='login-email' />
            </Form.Item>
            <Form.Item
                name='password'
                rules={[
                    { required: true, message: '请输入密码' },
                    {
                        type: 'string',
                        pattern: /^[0-9a-zA-Z@\.]{8,20}$/,
                        transform: v => v.trim(),
                        message: '密码格式错误，8-20位，只能包含：数字、字母、@、.'
                    }
                ]}
                validateTrigger='onBlur'
            >
                <Input.Password prefix={<LockOutlined className='icon' />} placeholder='密码，8-20位' className='input' id='login-password' />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
                <Button htmlType="submit" className='submit' loading={loading}>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
}

export default Login