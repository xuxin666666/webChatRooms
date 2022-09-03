import React, { useState } from 'react'
import { Input, Modal, Descriptions, Col, Row, Button } from 'antd'
import axios from 'axios';

import Image from '../components/Image';
import { message } from '../pkg';
import { useUserInfo } from '../hooks';
import type {Dispatches, Group} from './container/joinGroupContainer'

import './scss/joinGroup.scss'


type SearchStatus = '' | 'error'
interface GroupSearch extends Group {
    joined: boolean
    description: string
    username: string
}
function assertIsInputElement(e: any): asserts e is HTMLInputElement { }


const JoinGroup: React.FC<{
    addGroup: Dispatches['addGroup']
    setCurrent: Dispatches['setCurrent']
}> = ({ addGroup, setCurrent }) => {
    const [detail, setDetail] = useState<GroupSearch | null>(null)
    const [searchText, setSearchText] = useState('')
    const [status, setStatus] = useState<SearchStatus>('')
    const [loading, setLoading] = useState(false)
    const [isModalVisible, setIsModalVisible] = useState(false);

    const userInfo = useUserInfo()

    const searchOnChange = (e: React.ChangeEvent) => {
        assertIsInputElement(e.target)
        setSearchText(e.target.value)
        setStatus('')
    }

    const onSearch = (value: string) => {
        if(!/^[0-9]{9}$/.test(value)) {
            setStatus('error')
            message.warn('请输入正确的群id')
            return
        }
        setLoading(true)
        axios.get(`/group/search?id=${value}`).then(({data}) => {
            setDetail(data)
        }).catch(err => {
            message.error('搜索失败')
            setDetail(null)
        }).then(() => {
            setLoading(false)
        })
    }

    const joinGroup = () => {
        axios.post('/group/join', {gid: detail!.gid}).then(({data}) => {
            addGroup({
                id: data.id,
                gid: detail!.gid,
                name: detail!.name,
                avatar: detail!.avatar,
                owner: userInfo.uid,
                read: true
            })
            setCurrent(detail!.gid)
            setIsModalVisible(false)
            setDetail(null)
            setSearchText('')
        }).catch(err => {
            message.error('加入失败')
        })
    }

    return (
        <>
            <span onClick={() => setIsModalVisible(true)}>加入群聊</span>
            <Modal
                title='加入群聊'
                className='join-group-modal'
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={false}
            >
                <Input.Search
                    className='inputSearch'
                    placeholder='请输入群的id号'
                    allowClear
                    onSearch={onSearch}
                    status={status}
                    value={searchText}
                    onChange={searchOnChange}
                    loading={loading}
                />
                <div className='des'>
                    {detail ? (
                        <Row align={'middle'}>
                            <Col span={4} >
                                <Row><Image className='avatar' preview src={detail.avatar} /></Row>
                                <Row className='join'>
                                    {detail!.joined ? (
                                        <Button disabled>已加入</Button>
                                    ) : (
                                        <Button onClick={joinGroup}>加入</Button>
                                    )}
                                </Row>
                            </Col>
                            <Col span={18} offset={2}>
                                <Descriptions column={1} className='description'>
                                    <Descriptions.Item label="群&emsp;&emsp;主">{detail!.username}</Descriptions.Item>
                                    <Descriptions.Item label="群聊名称">{detail.name}</Descriptions.Item>
                                    <Descriptions.Item label="群聊简介">
                                        <span className='intro'>{detail!.description}</span>
                                    </Descriptions.Item>
                                </Descriptions>
                            </Col>
                        </Row>
                    ) : (
                        <div className='no-result'>暂无结果</div>
                    )}
                </div>

            </Modal>
        </>
    )
}

export default JoinGroup