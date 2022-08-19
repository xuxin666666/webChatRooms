import path from 'path'
import fs, {StreamOptions} from 'fs'


// 用户日志
const customLogSetUp = () => new Promise((resolve: (value: void) => void, reject) => {
    let log: (...data: any[]) => void
    if (process.env.NODE_ENV === 'development') {
        log = console.log
    } else {
        let options: StreamOptions   = {
            flags: 'a',     // append模式
            encoding: 'utf8',  // utf8编码
        };

        let stdout = fs.createWriteStream(path.join(__dirname, './custom.log'), options)
        let logger = new console.Console(stdout, undefined, false)

        log = logger.log
    }

    // 添加console.logger的输出方式
    console.logger = (...value: any[]) => {
        value.forEach((item, index) => {
            if(item instanceof Error)
                value[index] = item.message
            else if(typeof item === 'object')
                value[index] = JSON.stringify(item)
            
        })

        let time = new Date().format('yyyy-MM-dd HH:mm:ss.fff');
        let trace  = getCallerFileNameAndLine()
        // 时间亮黑色（灰），路径青蓝色
        log(`[\x1b[1;40;90m%s\x1b[0m]-[\x1b[1;40;36m%s\x1b[0m]:  %s`, time, trace, value.join(' '))
    }
    console.log('日志功能启动，内容将输出至:', process.env.NODE_ENV === 'development' ? '控制台': '文件')
    resolve()
})

// 找打印输出的位置，路径及所在行列
function getCallerFileNameAndLine(){
    // 手动抛出并捕获错误
    function getException() {
        try {
            throw Error('');
        } catch (err: any) {
            return err;
        }
    }

    const err = getException();

    const stack = (<Error>err).stack;
    const stackArr = stack!.split('\n');

    // console.trace()
    let callerLogIndex = 0;
    for (let i = 0; i < stackArr.length; i++) {
        // 注意要找的是哪个字符串
        // 因为重定义了console.log方法，因此要多追加一层，所以直接找console.log
        if (stackArr[i].indexOf('console.log') > 0 && i + 1 < stackArr.length) {
            callerLogIndex = i + 1;
            break;
        }
    }

    if (callerLogIndex !== 0) {
        const callerStackLine = stackArr[callerLogIndex];
        const rightK = callerStackLine.lastIndexOf(')')

        return callerStackLine.substring(callerStackLine.lastIndexOf(__rootpath) + __rootpath.length, rightK === -1 ? callerStackLine.length - 1 : rightK);
    } else {
        return '-';
    }
}

// morgan库的日志
const morganLogSetUp = () => {
    const morgan = require('morgan')

    if(process.env.NODE_ENV === 'development') {
        return morgan('dev')
    } else {
        let options: StreamOptions = {
            flags: 'a',     // append模式
            encoding: 'utf8',  // utf8编码
        };
    
        let stdout = fs.createWriteStream(path.join(__dirname, './morgan.log'), options)
        return morgan('combined', {
            stream: stdout
        })
    }
}

// 日期格式化方法
Date.prototype.format = function (format: string) {
    // 设置默认的时间格式化格式
    if (!format) {
        format = 'yyyy-MM-dd HH:mm:ss'
    }

    // 用0补齐指定位数
    let padNum = function (value: number, digits: number) {
        return Array(digits - value.toString().length + 1).join('0') + value
    };

    // 指定格式字符
    let cfg: {[key: string]: string} = {
        yyyy: this.getFullYear().toString(),    // 年
        MM: padNum(this.getMonth() + 1, 2),     // 月
        dd: padNum(this.getDate(), 2),          // 日
        HH: padNum(this.getHours(), 2),         // 时
        mm: padNum(this.getMinutes(), 2),       // 分
        ss: padNum(this.getSeconds(), 2),       // 秒
        fff: padNum(this.getMilliseconds(), 3)  // 毫秒
    };

    // 正则匹配替换
    return format.replace(/([a-z]|[A-Z])(\1)*/ig, function (m: string) {
        return cfg[m]
    })
}

export {
    customLogSetUp,
    morganLogSetUp
}