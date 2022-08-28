import React, { useState } from 'react'
import { Form, Input, Modal } from 'antd'
import { useForm } from 'antd/lib/form/Form';
import axios from 'axios';
import type { FormProps } from 'antd';

import { useUserInfo } from '../hooks';
import { message } from '../pkg';
import type { Dispatches } from './container/createGroupContainer';


const CreateGroup: React.FC<{
    addGroup: Dispatches['addGroup']
    setCurrent: Dispatches['setCurrent']
}> = ({ addGroup, setCurrent }) => {
    const [form] = useForm()
    const userInfo = useUserInfo()

    const [loading, setLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);

    const handleOk = () => {
        form.submit()
    }

    const onFinish: FormProps['onFinish'] = (values: {
        name: string
        description: string
    }) => {
        setLoading(true)
        axios.post('/group', values).then(({ data }) => {
            setIsModalVisible(false)
            addGroup({
                id: data.id,
                gid: data.gid,
                name: values.name,
                avatar: data.avatar,
                read: true,
                owner: userInfo.uid
            })
            setCurrent(data.gid)
            form.resetFields()
            message.success('创建群聊成功')
        }).catch(err => {
            message.error('创建群聊失败')
        }).then(() => {
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

    const handleCancel = () => {
        setIsModalVisible(false)
        form.resetFields()
    }

    return (
        <>
            <span onClick={() => setIsModalVisible(true)}>创建群聊</span>
            <Modal
                title='创建群聊'
                visible={isModalVisible}
                confirmLoading={loading}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form
                    className='form'
                    labelAlign='right'
                    labelCol={{ span: 4 }}
                    form={form}
                    scrollToFirstError
                    initialValues={{
                        name: '',
                        description: ''
                    }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                >
                    <Form.Item
                        label='群聊名称'
                        name='name'
                        rules={[
                            { required: true, message: '请输入名称' },
                            { min: 2, max: 20, message: '名称2-20位' }
                        ]}
                        validateTrigger='onBlur'
                    >
                        <Input className='input' />
                    </Form.Item>
                    <Form.Item
                        label='群聊简介'
                        name='description'
                        rules={[
                            { max: 1000, message: '简介1000字以内' }
                        ]}
                        validateTrigger='onBlur'
                    >
                        <Input.TextArea
                            maxLength={300}
                            autoSize={{ minRows: 6, maxRows: 6 }}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )
}

export default CreateGroup