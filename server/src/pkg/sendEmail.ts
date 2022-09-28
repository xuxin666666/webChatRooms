import nodemailer from 'nodemailer'
import config from 'config'


const {host, port, user, pass} = config.get('email')

const sendEmail = (email: string, code: string) => {
    return new Promise((resolve, reject) => {
        // pass: 授权码
        let trans = nodemailer.createTransport({
            host: host || 'smtp.qq.com',
            port: port || 465,
            secure: true,
            auth: { user, pass }
        })
        let message = {
            from: user,
            to: email,
            subject: '您好，外卖到了',
            text: `这是您的验证码：${code}，还有5分钟就凉了，请尽快食用`
        }
        trans.sendMail(message, (err, info) => {
            if (err) {
                console.logger("sendEmail:", err);
                return reject()
            }
            resolve(info)
        })
    })
}

export default sendEmail