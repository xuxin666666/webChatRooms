import axios from 'axios'
import store from 'store';
import React, { useState } from 'react'
import { useForm } from 'antd/lib/form/Form';
import { Card, Form, Row, Col, Input, Button } from 'antd'
import { EditOutlined, NumberOutlined, ExclamationCircleOutlined, LockOutlined } from '@ant-design/icons'
import type { FormProps } from 'antd';

import { useUserInfo, useCountDown } from '../hooks'
import { EmailOutlined } from '../components/Icons'
import { message } from '../pkg';

import './scss/account.scss'


interface ItemProps {
    label: string
    children: React.ReactNode
    editing: boolean
    setEditing: (editing: boolean) => void
    normalContent?: string
}
interface ChangeFieldProps {
    showContent?: string
}

const Item: React.FC<ItemProps> = ({ label, normalContent, children, editing, setEditing }) => (
    <Row className='item'>
        <Col span={6}>{label}</Col>
        {
            editing ? (
                <Col span={18}>{children}</Col>
            ) : (
                <>
                    <Col span={15}>
                        {normalContent}
                    </Col>
                    <Col span={3}>
                        <span className='edit' onClick={() => setEditing(true)}>
                            <EditOutlined />
                            编辑
                        </span>
                    </Col>
                </>
            )}
    </Row>
)

const ChangeEmail: React.FC<ChangeFieldProps> = ({ showContent }) => {
    const [emailEdit, setEmailEdit] = useState(false)
    const [loading, setLoading] = useState(false)
    const [sendCodeDisabled, setSendCodeDisabled] = useState(false)

    const [form] = useForm()
    const [timeRemain, setTimeRemain] = useCountDown(0, () => setSendCodeDisabled(false))

    const sendCode = () => {
        setSendCodeDisabled(true)
        setTimeRemain(60 * 1000)
        axios.post('/auth/sendCode2').then(() => {
            message.success('验证码发送成功')
        }).catch(err => {
            console.log(err)
            message.error('验证码发送失败')
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

    const onFinish: FormProps['onFinish'] = (values) => {
        setLoading(true)
        axios.post('/auth/changeEmail', values).then(() => {
            message.success('邮箱修改成功')
            store.set('userInfo', {
                ...store.get('userInfo'),
                email: values.email
            })
            setLoading(false)
            setEmailEdit(false)
            form.resetFields()
        }).catch(err => {
            let res = err.response
            if (res.status === 412) {
                message.error(res.data.msg)
            } else {
                message.error('邮箱更改失败')
            }
            setLoading(false)
        })
    }

    return (
        <Item
            label='邮箱'
            normalContent={showContent}
            editing={emailEdit}
            setEditing={setEmailEdit}
        >
            <span className='tips'>
                <ExclamationCircleOutlined className='tip' />
                先发送验证码到原邮箱，然后填写信息，验证成功后邮箱修改成功
            </span>
            <Form
                className='form change-email'
                form={form}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
            >
                <Form.Item >
                    <Row>
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
                    name='email'
                    rules={[
                        { required: true, message: '请输入邮箱' },
                        { type: 'email', message: '邮箱不合法' }
                    ]}
                    validateTrigger='onBlur'
                >
                    <Input prefix={<EmailOutlined className='icon' />} placeholder='邮箱' className='input' type='email' id='change-email' />
                </Form.Item>
                <Form.Item>
                    <Row>
                        <Col offset={6} span={8} >
                            <Button className='cancle submit' onClick={() => setEmailEdit(false)}>
                                Cancle
                            </Button>
                        </Col>
                        <Col offset={2} span={8}>
                            <Button htmlType="submit" className='submit' loading={loading}>
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Item>
    )
}

const ChangePassword: React.FC<ChangeFieldProps> = ({ showContent }) => {
    const [passwordEdit, setPasswordEdit] = useState(false)
    const [loading, setLoading] = useState(false)

    const [form] = useForm()

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

    const onFinish: FormProps['onFinish'] = (values) => {
        setLoading(true)

        axios.post('/auth/changePassword', {
            password: values.password,
            newPassword: values.newPassword
        }).then(() => {
            message.success('密码修改成功')
            form.resetFields()
            setLoading(false)
            setPasswordEdit(false)
        }).catch(err => {
            let res = err.response
            if (res.status === 412) {
                message.error(res.data.msg)
            } else {
                message.error('密码修改失败')
            }
            setLoading(false)
        })
    }

    return (
        <Item
            label='密码'
            normalContent={showContent}
            editing={passwordEdit}
            setEditing={setPasswordEdit}
        >
            <Form
                className='form'
                form={form}
                onFinishFailed={onFinishFailed}
                onFinish={onFinish}
            >
                <Form.Item
                    name='password'
                    rules={[
                        { required: true, message: '请输入旧密码' },
                        {
                            type: 'string',
                            pattern: /^[0-9a-bA-Z@.]{8,20}$/,
                            transform: v => v.trim(),
                            message: '密码格式错误，8-20位，只能包含：数字、字母、@、.'
                        }
                    ]}
                    validateTrigger='onBlur'
                >
                    <Input.Password prefix={<LockOutlined className='icon' />} placeholder='旧密码，8-20位' className='input' id='old-password' />
                </Form.Item>
                <Form.Item
                    name='newPassword'
                    rules={[
                        { required: true, message: '请输入新密码' },
                        {
                            type: 'string',
                            pattern: /^[0-9a-bA-Z@.]{8,20}$/,
                            transform: v => v.trim(),
                            message: '密码格式错误，8-20位，只能包含：数字、字母、@、.'
                        }
                    ]}
                    validateTrigger='onBlur'
                >
                    <Input.Password prefix={<LockOutlined className='icon' />} placeholder='新密码，8-20位' className='input' id='new-password' />
                </Form.Item>
                <Form.Item
                    name="confirm"
                    dependencies={['newPassword']}
                    rules={[
                        { required: true, message: '请重复新密码' },
                        {
                            type: 'string',
                            pattern: /^[0-9a-bA-Z@.]{8,20}$/,
                            transform: v => v.trim(),
                            message: '密码格式错误，8-20位，只能包含：数字、字母、@、.'
                        },
                        ({ getFieldValue }) => ({
                            validator(_, value) {
                                if (!value || getFieldValue('newPassword') === value) {
                                    return Promise.resolve();
                                }
                                return Promise.reject(new Error('两密码不相同'));
                            },
                        }),
                    ]}
                    validateTrigger='onBlur'
                >
                    <Input.Password prefix={<LockOutlined className='icon' />} placeholder='重复新密码' className='input' id='confirm-password' />
                </Form.Item>
                <Form.Item>
                    <Row>
                        <Col offset={6} span={8} >
                            <Button className='cancle submit' onClick={() => setPasswordEdit(false)}>
                                Cancle
                            </Button>
                        </Col>
                        <Col offset={2} span={8}>
                            <Button htmlType="submit" className='submit' loading={loading}>
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Item>
    )
}

const ResetPassword: React.FC<ChangeFieldProps> = () => {
    const [passwordReset, setPasswordReset] = useState(false)
    const [loading, setLoading] = useState(false)
    const [sendCodeDisabled, setSendCodeDisabled] = useState(false)

    const [form] = useForm()
    const [timeRemain, setTimeRemain] = useCountDown(0, () => setSendCodeDisabled(false))

    const sendCode = () => {
        setSendCodeDisabled(true)
        setTimeRemain(60 * 1000)
        axios.post('/auth/sendCode2').then(() => {
            message.success('验证码发送成功')
        }).catch(err => {
            console.log(err)
            message.error('验证码发送失败')
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

    const onFinish: FormProps['onFinish'] = (values) => {
        setLoading(true)
        axios.post('/auth/resetPassword', values).then(() => {
            message.success('密码修改成功')
            setLoading(false)
            setPasswordReset(false)
            form.resetFields()
        }).catch(err => {
            let res = err.response
            if (res.status === 412) {
                message.error(res.data.msg)
            } else {
                message.error('密码修改失败')
            }
            setLoading(false)
        })
    }

    return (
        <Item
            label='重置密码'
            editing={passwordReset}
            setEditing={setPasswordReset}
        >
            <span className='tips'>
                <ExclamationCircleOutlined className='tip' />
                先发送验证码到邮箱，然后填写信息，验证成功后密码修改成功
            </span>
            <Form
                className='form'
                form={form}
                onFinishFailed={onFinishFailed}
                onFinish={onFinish}
            >
                <Form.Item >
                    <Row>
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
                    name='password'
                    rules={[
                        { required: true, message: '请输入密码' },
                        {
                            type: 'string',
                            pattern: /^[0-9a-bA-Z@.]{8,20}$/,
                            transform: v => v.trim(),
                            message: '密码格式错误，8-20位，只能包含：数字、字母、@、.'
                        }
                    ]}
                    validateTrigger='onBlur'
                >
                    <Input.Password prefix={<LockOutlined className='icon' />} placeholder='密码，8-20位' className='input' id='reset-password' />
                </Form.Item>
                <Form.Item>
                    <Row>
                        <Col offset={6} span={8} >
                            <Button className='cancle submit' onClick={() => setPasswordReset(false)}>
                                Cancle
                            </Button>
                        </Col>
                        <Col offset={2} span={8}>
                            <Button htmlType="submit" className='submit' loading={loading}>
                                Submit
                            </Button>
                        </Col>
                    </Row>
                </Form.Item>
            </Form>
        </Item>
    )
}

const Account: React.FC = () => {
    const userInfo = useUserInfo()

    return (
        <Card className='card account'>
            <ChangeEmail showContent={userInfo.email} />
            <ChangePassword showContent='********' />
            <ResetPassword />
        </Card>
    )
}

export default Account