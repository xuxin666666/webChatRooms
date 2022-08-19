// 配置config读取配置文件的路径
import path from 'path'

const config = new Promise((resolve: (value: void) => void, reject) => {
    
    // 设置环境变量，使得config模块能够正确读取配置文件
    process.env["NODE_CONFIG_DIR"] = path.join(__dirname, './')

    const config = require('config')
    process.env['NODE_ENV'] = config.get('env')
    console.log('当前环境为:', process.env.NODE_ENV === 'development' ? '开发环境' : '生产环境')
    resolve()
})

export default config