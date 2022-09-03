// 定义项目根路径
import path from 'path'

// 导入配置部分
import './config'
// 导入一些其他操作
import './utils'
// 导入日志部分
import {customLogSetUp} from './log'
// 导入数据库部分
import { mysqlSetUp } from './mysql/setup'
// 导入路由部分
import routerSetUp from './route'
import {ACheckUserExist} from './mysql/user'


async function main() {
    
    // await configSetUp()

    await customLogSetUp()

    await mysqlSetUp()

    await routerSetUp()

    const { GAddMember, GCreateGroup, GDeleteGroup } = require('./mysql/group')
    const {ACreateUser} = require('./mysql/user')
    const {default: getUUID} = require('./pkg/uuid')

    async function a() {
        // let res = await GJoinGroup('qwert', '123321')
        // let res = await GDeleteGroup('123321')
        // let res = await GCreateGroup('dasdv', '123321', 'group1')
        // res = await GAddMember('qwert', '123321')

        // let res = await ACheckUserExist({username: 'admin'})
        // console.log(res)
        
        // for(let i = 4; i < 100; i++) {
        //     ACreateUser({
        //         username: 'test' + i,
        //         password: 12345678,
        //         email: Math.random().toFixed(6) + '@qq.com',
        //         uid: getUUID(),
        //         create_time: Date.now() - Math.floor(86400 * 1000 * 10 * Math.random())
        //     })
        // }
    }
    // a()
}
main()