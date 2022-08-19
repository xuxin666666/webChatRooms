import axios from 'axios'
import store from 'store'
import moment from 'moment'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Card, Descriptions, Upload, Form, Input, DatePicker, Radio } from 'antd'
import { EditOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import ImgCrop from 'antd-img-crop'
import type { UploadProps, FormInstance, DatePickerProps, FormProps } from 'antd'

import { useUserInfo, useCountDown } from '../hooks'
import { SubmitOutLined } from '../components/Icons'
import Image from '../components/Image'
import { timeCountDown, message } from '../pkg'

import './scss/profile.scss'


type UserRole = 'topAdmin' | 'seniorAdmin' | 'admin' | 'normal'
type Gender = 0 | 1 | 2
const genders = ['未知', '男', '女']

enum UserRoles {
    topAdmin = '超级管理员',
    seniorAdmin = '高级管理员',
    admin = '管理员',
    normal = '普通用户'
}


interface UserEditInfo {
    username: string
    signature: string
    gender: Gender
    birthday: number
}
interface UserDetail extends UserEditInfo {
    email: string
    role: UserRole
    uid: number
    lastOnline: number
}
interface UserShowInfo extends UserDetail {
    avatar: string
}
interface EditType extends UserEditInfo {
    avatar: string
    formInstance: React.MutableRefObject<FormInstance | null>
    onFinish: (values: UserEditInfo) => void
}


const useForm = Form.useForm

const Show: React.FC<UserShowInfo> = ({ avatar, username, email, birthday, role, lastOnline, signature, uid, gender }) => (
    <div className='showing'>
        <Image src={avatar} preview className='img' />
        <Descriptions column={1} className='description'>
            <Descriptions.Item label='uid'>
                {uid}
            </Descriptions.Item>
            <Descriptions.Item label='昵称'>
                {username}
            </Descriptions.Item>
            <Descriptions.Item label='性别'>
                {genders[gender!]}
            </Descriptions.Item>
            <Descriptions.Item label='邮箱'>
                {email}
            </Descriptions.Item>
            <Descriptions.Item label='生日'>
                {birthday ? moment(birthday).format('YYYY-MM-DD') : '-- --'}
            </Descriptions.Item>
            <Descriptions.Item label='角色'>
                {UserRoles[role] || '???'}
            </Descriptions.Item>
            <Descriptions.Item label='上次登录'>
                {moment(lastOnline).fromNow()}
            </Descriptions.Item>
            <Descriptions.Item label='个性签名' contentStyle={{ maxWidth: '300px' }}>
                {signature || '（无）'}
            </Descriptions.Item>
        </Descriptions>
    </div>
)

const Edit: React.FC<EditType> = ({ avatar, username, gender, birthday, signature, formInstance, onFinish }) => {
    const [uploading, setUploading] = useState(false)
    const [form] = useForm()

    useEffect(() => {
        formInstance.current = form
    }, [form, formInstance])

    // 限制png、jpg、jpeg、gif文件，3M
    const beforeUpload: UploadProps['beforeUpload'] = (file) => {
        const allowTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif']
        if (!allowTypes.includes(file.type)) {
            message.error('Only allow a png/jpg/jpeg/gif file!')
            return false
        }

        const isLt3M = file.size / 1024 / 1024 < 3;
        if (!isLt3M) {
            message.error('Image must be smaller than 3MB!');
            return false
        }

        return true
    }

    const upload: UploadProps['customRequest'] = (file) => {
        let param = new FormData()
        param.append('avatar', file.file)

        setUploading(true);
        axios.post('/auth/changeAvatar', param)
            .then(({ data }) => {
                store.set(
                    'userInfo',
                    { ...store.get('userInfo'), avatar: data }
                )
            })
            .catch(err => {
                console.log(err)
                message.error('更换头像失败')
            }).catch(() => { }).then(() => setUploading(false))
    }

    const disabledDate: DatePickerProps['disabledDate'] = (current) => {
        // Can not select days before today and today
        return current && current > moment().endOf('day');
    };

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
        <div className='editing'>
            <ImgCrop rotate>
                <Upload
                    beforeUpload={beforeUpload}
                    customRequest={upload}
                    showUploadList={false}
                    listType='picture-card'
                    name='avatar'
                    accept='.png, .jpg, .jpeg, .gif'
                    className='upload'
                >
                    <Image src={avatar} alt='avatar' className='img' />
                    {uploading ? <LoadingOutlined /> : <PlusOutlined />}
                </Upload>
            </ImgCrop>

            <Form
                form={form}
                className='form edit-info'
                scrollToFirstError
                initialValues={{
                    username, gender, birthday: moment(birthday), signature
                }}
                onFinish={onFinish}
                onFinishFailed={onFinishFailed}
                labelCol={{ span: 8 }}
                wrapperCol={{ span: 16 }}
            >
                <Form.Item
                    name='username'
                    label='昵称'
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
                    <Input placeholder='昵称，2-16位' className='input' />
                </Form.Item>
                <Form.Item name='gender' label='性别'>
                    <Radio.Group className='radio-group'>
                        <Radio value={0}>{genders[0]}</Radio>
                        <Radio value={1}>{genders[1]}</Radio>
                        <Radio value={2}>{genders[2]}</Radio>
                    </Radio.Group>
                </Form.Item>
                <Form.Item name='birthday' label='生日'>
                    <DatePicker disabledDate={disabledDate} />
                </Form.Item>
                <Form.Item
                    name='signature'
                    label='个性签名'
                    rules={[
                        { type: 'string', max: 100, message: '字数须小于100位' }
                    ]}
                    validateTrigger='onBlur'
                >
                    <Input.TextArea
                        placeholder="个性签名，字数须小于100位"
                        autoSize
                        maxLength={100}
                    />
                </Form.Item>
            </Form>
        </div>
    )
}

const Profile: React.FC = () => {
    const userInfo = useUserInfo()
    const [userDetail, setUserDetail] = useState<UserDetail>({
        uid: 100000000,
        username: '',
        gender: 0,
        role: 'normal',
        email: '',
        signature: 'hello world!',
        birthday: 946684800000, // 2000-01-01
        lastOnline: 0
    })
    const [loading, setLoading] = useState(true)
    const [editing, setEditing] = useState(false)
    const [submiting, setSubmiting] = useState(false)

    const [blockTime] = useCountDown(323213234)

    const formInstance = useRef<FormInstance | null>(null)


    const getUserInfo = useCallback<(values?: UserEditInfo) => void>((values) => {
        setLoading(true)
        axios.post('/auth/profile', values).then(({ data }) => {
            setUserDetail({ ...data })
            setEditing(false)
            setLoading(false)
            setSubmiting(false)

            store.set('userInfo', {
                ...store.get('userInfo'),
                username: data.username,
            })
        }).catch(err => {
            message.error('获取用户信息失败')
        })
    }, [])

    useEffect(() => {
        getUserInfo()
    }, [getUserInfo])

    const submit = () => {
        if (submiting) {
            message.warn('提交中')
            return
        }
        formInstance.current?.submit()
    }

    const callback = (values: UserEditInfo) => {
        setSubmiting(true)
        getUserInfo({ ...values, birthday: values.birthday.valueOf() })
    }


    return (
        <Card
            title={
                <>
                    个人资料
                    {Boolean(blockTime) && (
                        <span style={{ color: 'red', fontSize: 14 }}>
                            （
                            {timeCountDown(blockTime)}
                            {/* {moment(blockTime).countDown()} */}
                            后账号解封）
                        </span>
                    )}
                </>
            }
            className='profile card'
            loading={loading}
            extra={
                editing ? (
                    <span className='edit'>
                        {submiting && <LoadingOutlined className='loading' />}
                        <SubmitOutLined onClick={submit} />
                    </span>
                ) : (
                    <EditOutlined className='edit' onClick={() => setEditing(true)} />
                )
            }
        >
            {
                editing ? (
                    <Edit
                        formInstance={formInstance}
                        onFinish={callback}
                        avatar={userInfo.avatar}
                        username={userDetail.username}
                        gender={userDetail.gender}
                        birthday={userDetail.birthday}
                        signature={userDetail.signature}
                    />
                ) : <Show avatar={userInfo.avatar} {...userDetail} />
            }
        </Card>
    )
}

export default Profile