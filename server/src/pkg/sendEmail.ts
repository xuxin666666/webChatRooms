import nodemailer from 'nodemailer'


const sendEmail = (email: string, code: string) => {
    return new Promise((resolve, reject) => {
        // 授权码: zedchdmneosudbdc
        let trans = nodemailer.createTransport({
            host: 'smtp.qq.com',
            port: 465,
            secure: true,
            auth: {
                user: '3268154595@qq.com',
                pass: 'zedchdmneosudbdc'
            }
        })
        let message = {
            from: '3268154595@qq.com',
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