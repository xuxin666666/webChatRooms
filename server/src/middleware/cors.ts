import { Request, Response, NextFunction } from 'express'

// 简单的cors
export default (req: Request, res: Response, next: NextFunction) => {
    let origin = req.headers.origin

    // 设置响应头
    res.header('Access-Control-Allow-Origin', origin)
    res.header('Access-Control-Allow-Headers', '*')
    res.header('Access-Control-Allow-Methods', 'POST, GET, OPTIONS')

    // options方法直接放行
    if(req.method.toLowerCase() === 'options') {
        res.send({status: 200})
    } else {
        next()
    }
}