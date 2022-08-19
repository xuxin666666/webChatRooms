class Store {
    data: {[key: string]: any}
    constructor() {
        this.data = {}
    }
    get(prop: string, defaultVal: any) {
        return this.data[prop] || defaultVal
    }
    set(prop: string, val: any) {
        this.data[prop] = val
    }
    has(prop: string) {
        return this.data.hasOwnProperty(prop)
    }
}

class Email {
    data: {
        [key: string]: {
            email: string,
            code: string,
            expired: number,
            timer: NodeJS.Timer
        }
    }
    duration: number

    constructor(duration = 300) {
        this.data = {}
        this.duration = duration * 1000
    }

    // 生成验证码
    generate(email: string) {
        let code = Math.floor(Math.random() * 1e6).toString()
        while (code.length < 6) {
            code = '0' + code
        }
        this.set(email, code)
        return code
    }

    set(email: string, code: string) {
        // 如果已存在，则清除定时器
        if(this.data[email]) {
            clearTimeout(this.data[email].timer)
        }
        // 存一份数据，会覆盖掉旧的
        let time = new Date().getTime()
        this.data[email] = {
            email,
            code,
            expired: time + this.duration,
            // 到期后自动删除
            timer: setTimeout(() => {
                delete this.data[email]
            }, this.duration)
        }
    }

    check(email: string, code: string) {
        // 储存中没有这个邮箱
        if(!this.data[email]) {
            return false
        }
        // 验证
        let res = this.data[email], time = new Date().getTime()
        if(code === res.code && time <= res.expired) {
            // 验证通过后删除
            delete this.data[email]
            return true
        } else {
            return false
        }
    }
}

const store = new Store()
const emailStore = new Email()


export {
    store,
    emailStore
}