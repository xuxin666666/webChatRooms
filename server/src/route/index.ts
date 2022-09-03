import express, { Express } from 'express'
import bodyParser from 'body-parser'
import config from 'config'
import formidable from 'formidable'
import path from 'path'
import http from 'http'

import cors from '../middleware/cors'
import { authHttp } from '../middleware/auth'
import { isGroupExist, isGroupOwner } from '../middleware/group'
import { morganLogSetUp } from '../log'
import '../pkg/file'

import controller from '../controller'
import { startSocket } from '../socket'


const routeSetUp = () => new Promise((
    resolve: (value: void) => void,
    reject
) => {
    const app = express()

    // cors解决跨域问题
    app.use(cors)

    // 使用morgan日志输出
    app.use(morganLogSetUp())

    // 解析post请求的参数
    app.use(bodyParser.json()) // application/json
    app.use(bodyParser.urlencoded({ extended: true })) // application/x-www-form-urlencoded

    // 根路径响应
    app.all('/', (req, res) => {
        console.log(req.params, req.query, req.body)
        res.send({
            status: 200,
            msg: 'All being OK!'
        })
    })

    // 处理各种路由
    routers(app)

    // 各种图片
    app.get('/static/:type/:image', controller.MGetImage)
    // 其他所有不存在的路径
    app.all("*", controller.MPageNotFound)

    // 开始监听
    const { port, hostname } = config.get('server')

    const server = http.createServer(app)

    startSocket(server);
    server.listen(port, () => {
        console.logger(`服务器启动成功，网址：http://${hostname}:${port}`)
        resolve()
    })
})

function routers(app: Express) {
    // 用户部分
    const auth = express.Router()
    {
        auth.post('/login', controller.ALogin)
        auth.post('/register', controller.ARegister)
        auth.post('/sendCode', controller.ASendValidateCode)
        // 登录状态认证
        auth.use(authHttp)
        auth.get('/auto', controller.AAutoLogin)
        auth.get('/role', controller.AGetUserRole)
        auth.get('/search', controller.ASearchUser)
        auth.get('/messageStatus', controller.AGetMessageStatus)
        auth.post('/messageAlert', controller.AMessageAlert)
        auth.post('/messageSystem', controller.AMessageSystem)
        auth.post('/sendCode2', controller.ASendValidateCode2)
        auth.post('/changeAvatar', controller.AChangeAvatar)
        auth.post('/profile', controller.AProfile)
        auth.post('/changePassword', controller.AChangePassword)
        auth.post('/resetPassword', controller.AResetPassword)
        auth.post('/changeEmail', controller.AChangeEmail)
        auth.post('/changeRole', controller.AChangeUserRole)
        auth.post('/blockUser', controller.ABlockUser)
        auth.post('/unBlockUser', controller.AUnBlockUser)
        auth.post('/filter', controller.AFilterUsers)
        auth.delete('/avatar', controller.ADeleteAvatar)
    }
    app.use('/auth', auth)


    // 群部分
    const group = express.Router()
    {
        // 登录状态认证
        group.use(authHttp)
        group.get('/getMessages', isGroupExist, controller.GGetMessages)
        group.get('/getGroup', controller.GGetGroups)
        group.get('/', controller.GGetGroupInfo)
        group.get('/search', controller.GSearchGroup)
        group.get('/members', isGroupExist, controller.GGetMembers)
        group.post('/', controller.GCreateGroup)
        group.post('/changeRole', controller.GChangeMemberRole)
        group.post('/avatar', controller.GChangeAvatar)
        group.post('/changeInfo', controller.GChangeBasicInfos)
        group.post('/join', controller.GJoinGroup)
        group.delete('/', controller.GDeleteGroup)
        group.delete('/avatar', controller.GDeleteAvatar)
    }
    app.use('/group', group)




    app.get('/wel', (req, res) => {
        const form = new formidable.IncomingForm({
            uploadDir: path.join(__dirname, '../uploads')
        })

        form.parse(req, (err, fileds, files) => {
            res.send({
                status: 200,
                msg: '欢迎',
                fileds,
                files
            })
        })
    })
}


export default routeSetUp