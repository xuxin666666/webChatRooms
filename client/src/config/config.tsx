// import config from 'config'
import axios from 'axios'
import store from 'store'
import expirePlugin from 'store/plugins/expire'
import moment from 'moment'
import 'moment/locale/zh-cn'

// import config from './config.json'
import { message, timeCountDown } from '../pkg'


export const baseURL = "http://127.0.0.1:8080"
export const imageUrl = "http://127.0.0.1:8080/static"
export const ioUrl = "http://127.0.0.1:8080"

const CONFIG = {
    init: function () {
        this.handleStore()
        this.handleAxios()
        this.handleMoment()
    },
    handleStore: function () {
        store.addPlugin(expirePlugin)
        // store.set('foo', 'bar', new Date().getTime() + 3000)

        let { set } = store, e = new Event('userInfo')
        store.set = function (key, ...others) {
            set.call(this, key, ...others)
            if (key === 'userInfo') window.dispatchEvent(e)
        }
    },
    handleAxios: function () {
        axios.defaults.baseURL = baseURL
        axios.interceptors.request.use(
            config => {
                config.headers = {
                    Authorization: 'Bearer ' + store.get('token')
                }
                // config.headers['Content-Type'] = 'application/json'
                return config
            },
        )
        axios.interceptors.response.use(
            response => {
                return response
            },
            error => {
                const code = error.response && error.response.status;
                if (code === 400) {
                    let { blocked_time } = error.response.data
                    message.error(`您已被封号，${timeCountDown(blocked_time - Date.now())}后解封`, 5)
                    if (window.location.pathname !== '/') {
                        window.location.pathname = '/'
                    }
                } else if (code === 401) {
                    if (window.location.pathname !== '/') {
                        message.warn('登录信息失效，请重新登录')
                        window.location.pathname = '/'
                    }
                } else return Promise.reject(error)
            }
        )
    },
    handleMoment: function () {
        moment.locale('zh-cn')
    },
}

CONFIG.init()

