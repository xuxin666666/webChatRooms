import Joi from 'joi'

import { UserRegister, UserLogin } from '../model/user'

/**
 * 验证用户注册的参数
 */
const validateUserRegister = (user: UserRegister) => {
    let schema = Joi.object({
        username: Joi.string().min(2).max(16).required().error(new Error('用户名格式错误')),
        password: Joi.string().min(8).max(20).required().error(new Error('密码格式错误')),
        email: Joi.string().email().required().error(new Error('邮箱格式错误')),
        code: Joi.string().min(6).max(6).required().error(new Error('验证码格式错误'))
    })

    let res = schema.validate(user)
    if (res.error) {
        console.logger('validateUserRegister: user:', user, 'err:', res.error.message)
        return false
    }
    return true
}

/**
 * 验证用户登入的参数
 */
const validateUserLogin = (user: UserLogin) => {
    const schema = Joi.object({
        password: Joi.string().min(8).max(20).required().error(new Error('密码格式错误')),
        email: Joi.string().email().required().error(new Error('邮箱格式错误'))
    })

    let res = schema.validate(user)
    if (res.error) {
        console.logger('validateUserLogin: user:', user, 'err:', res.error.message)
        return false
    }
    return true
}

const validatePassword = (password: string) => {
    const schema = Joi.object({
        password: Joi.string().min(8).max(20).required().error(new Error('密码格式错误')),
    })

    let res = schema.validate({ password })
    if (res.error) {
        console.logger('validatePassword:', password, 'err:', res.error.message)
        return false
    }
    return true
}


const validateEmail = (email: string) => {
    const schema = Joi.object({
        email: Joi.string().email().error(new Error('邮箱格式错误'))
    })

    let res = schema.validate({ email })
    if (res.error) {
        console.logger('ValidateEmail: email:', email, 'err:', res.error.message)
        return false
    }
    return true
}

type ValidateType = 'gender' | 'signature' | 'birthday' | 'email' | 'password' | 'username' | 'groupname' | 'description'
const schema = {
    gender: Joi.object({
        gender: Joi.number().min(0).max(2)
    }),
    signature: Joi.object({
        signature: Joi.string().max(100)
    }),
    birthday: Joi.object({
        birthday: Joi.number().min(new Date('1960-01-01').getTime())
    }),
    email: Joi.object({
        email: Joi.string().email().error(new Error('邮箱格式错误'))
    }),
    password: Joi.object({
        password: Joi.string().min(8).max(20).required().error(new Error('密码格式错误')),
    }),
    username: Joi.object({
        username: Joi.string().min(2).max(16).error(new Error('用户名格式错误'))
    }),
    groupname: Joi.object({
        groupname: Joi.string().min(2).max(20)
    }),
    description: Joi.object({
        description: Joi.string().max(300)
    }),
}
const validate = (type: ValidateType, data: any) => {
    try {
        if (typeof data !== 'object') data = { [type]: data }
        let res = schema[type].validate(data)
        if (res.error) {
            console.logger('validate:' + type + ':', data, 'err:', res.error.message)
            return false
        }
        return true
    } catch (err) {
        console.logger('validate:' + type + ':', data, 'err:', err)
        return false
    }
}

export {
    validateUserRegister,
    validateUserLogin,
    validateEmail,
    validatePassword,
    validate
}