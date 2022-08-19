import axios from "axios"
import store from "store"
import { message } from "antd"

// const autoLogin = () => {
//     axios.get('/auth/auto').then(({data: {avatar, username}}) => {
//         store.set('userInfo', {username, avatar})
//         message.success('登录成功', 100)
//     }).catch((err) => {
//         console.log(err)
//     })
// }
// autoLogin()