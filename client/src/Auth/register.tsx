import React, { useState } from 'react'
import axios from 'axios';
import { Form, Input, Button, Col, Row } from 'antd'
import { UserOutlined, LockOutlined, NumberOutlined } from '@ant-design/icons';
import type {FormProps} from 'antd'

import { EmailOutlined } from '../components/Icons'
import { useCountDown } from '../hooks';
import { message } from '../pkg';


const useForm = Form.useForm

const Register: React.FC<{ toggleClick: Function }> = ({ toggleClick }) => {
    const [sendCodeDisabled, setSendCodeDisables] = useState(false)
    const [loading, setLoading] = useState(false)

    const [timeRemain, setTimeRemain] = useCountDown(0, () => setSendCodeDisables(false))

    const [form] = useForm()


    const onFinish: FormProps['onFinish'] = (value) => {
        setLoading(true)
        axios.post('/auth/register', value).then(res => {
            message.success('注册成功')
            toggleClick()
        }).catch(err => {
            // console.log(err)
            if (err.response.data && err.response.data.msg) {
                message.error(err.response.data.msg)
            } else {
                message.error('注册失败')
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

    const sendCode = () => {
        form.validateFields(['email']).then((value) => {
            setSendCodeDisables(true)
            setTimeRemain(60000)
            axios.post('/auth/sendCode', { email: value.email })
                .then(({ data: { msg } }) => {
                    message.success(msg)
                })
                .catch(err => {
                    // console.log(err)
                    if (err.response.data && err.response.data.msg) {
                        message.error(err.response.data.msg)
                    } else {
                        message.error('验证码发送失败')
                    }
                })
        }).catch(onFinishFailed)
    }

    return (
        <Form
            form={form}
            className='register form'
            scrollToFirstError
            initialValues={{
                email: '',
                username: '',
                password: '',
                code: ''
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
                <Input prefix={<EmailOutlined className='icon' />} placeholder='邮箱' className='input' type='email' id='register-email' />
            </Form.Item>
            <Form.Item >
                <Row >
                    <Col span={12}>
                        <Form.Item
                            name='code'
                            rules={[
                                { type: 'string', pattern: /^[0-9]{6}$/, message: '请正确填写验证码', required: true }
                            ]}
                            validateTrigger='onBlur'
                            noStyle
                        >
                            <Input prefix={<NumberOutlined className='icon' />} placeholder='验证码' className='input' />
                        </Form.Item>
                    </Col>
                    <Col span={10} offset={2} >
                        <Button disabled={sendCodeDisabled} className='send-code' onClick={sendCode} >
                            {
                                sendCodeDisabled
                                    ? `${timeRemain / 1000}s 后重新获取`
                                    : '获取验证码'
                            }
                        </Button>
                    </Col>
                </Row>
            </Form.Item>
            <Form.Item
                name='username'
                rules={[
                    { required: true, message: '请输入昵称' },
                    {
                        type: 'string',
                        pattern: /^[0-9a-zA-Z\u4e00-\u9fa5]{2,16}$/,
                        transform: v => v.trim(),
                        message: '昵称格式错误，2-16位，只能包含：数字、字母、中文'
                    }
                ]}
                validateTrigger='onBlur'
            >
                <Input prefix={<UserOutlined className='icon' />} placeholder='昵称，2-16位' className='input' />
            </Form.Item>
            <Form.Item
                name='password'
                rules={[
                    { required: true, message: '请输入密码' },
                    {
                        type: 'string',
                        pattern: /^[0-9a-bA-Z@\.]{8,20}$/,
                        transform: v => v.trim(),
                        message: '密码格式错误，8-20位，只能包含：数字、字母、@、.'
                    }
                ]}
                validateTrigger='onBlur'
            >
                <Input.Password prefix={<LockOutlined className='icon' />} placeholder='密码，8-20位' className='input' id='register-password' />
            </Form.Item>
            <Form.Item wrapperCol={{ offset: 8, span: 8 }}>
                <Button htmlType="submit" className='submit' loading={loading}>
                    注册
                </Button>
            </Form.Item>
        </Form>
    )
}

export default Register