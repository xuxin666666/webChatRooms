import React from 'react'
import { Card } from 'antd'
import { AntDesignOutlined, GithubOutlined } from '@ant-design/icons'

import { LinkToNewBlankOutlined, MDNOutlined, IconFontOutlined, RunoobOutlined, W3schoolOutlined, NpmOutlined, WeChatDevelopOutlined, VantWeappOutlined, JuejinOutlined, ReactOutlined, VuewOutlined } from '../components/Icons'

import './scss/websites.scss'


const OutLink: React.FC<{
    children: React.ReactNode
    href: string
}> = ({ children, href }) => (
    <a href={href} target='_blank' className='out-link' rel='noreferrer'>
        <span>{children}</span>
        <LinkToNewBlankOutlined />
    </a>
)

const WebSites: React.FC = () => {

    return (
        <Card className='websites card'>
            <div className='description'>
                <div className='item'>
                    <AntDesignOutlined className='icon' />
                    <OutLink href='https://ant.design/components/overview-cn/'>
                        Ant Design
                    </OutLink>
                </div>
                <div className='item'>
                    <IconFontOutlined className='icon' />
                    <OutLink href='https://www.iconfont.cn/'>
                        iconfont
                    </OutLink>
                </div>
                <div className='item'>
                    <GithubOutlined className='icon' />
                    <OutLink href='https://github.com/'>
                        Github
                    </OutLink>
                </div>
                <div className='item'>
                    <MDNOutlined className='icon' />
                    <OutLink href='https://developer.mozilla.org/zh-CN/docs/Web'>
                        MDN
                    </OutLink>
                </div>
                <div className='item'>
                    <RunoobOutlined className='icon' />
                    <OutLink href='https://www.runoob.com/'>
                        菜鸟教程
                    </OutLink>
                </div>
                <div className='item'>
                    <W3schoolOutlined className='icon' />
                    <OutLink href='https://www.w3school.com.cn/'>
                        w3school
                    </OutLink>
                </div>
                <div className='item'>
                    <NpmOutlined className='icon' />
                    <OutLink href='https://www.npmjs.com/'>
                        npm
                    </OutLink>
                </div>
                <div className='item'>
                    <WeChatDevelopOutlined className='icon' />
                    <OutLink href='https://developers.weixin.qq.com/miniprogram/dev/framework/'>
                        微信开发者文档
                    </OutLink>
                </div>
                <div className='item'>
                    <VantWeappOutlined className='icon' />
                    <OutLink href='https://vant-contrib.gitee.io/vant-weapp/#/quickstart'>
                        Vant Weapp
                    </OutLink>
                </div>
                <div className='item'>
                    <JuejinOutlined className='icon' />
                    <OutLink href='https://juejin.cn/frontend'>
                        掘金
                    </OutLink>
                </div>
                <div className='item'>
                    <ReactOutlined className='icon' />
                    <OutLink href='https://react.docschina.org/docs/getting-started.html'>
                        React
                    </OutLink>
                </div>
                <div className='item'>
                    <VuewOutlined className='icon' />
                    <OutLink href='https://cn.vuejs.org/v2/api/'>
                        Vue
                    </OutLink>
                </div>
            </div>
        </Card>
    )
}

export default WebSites