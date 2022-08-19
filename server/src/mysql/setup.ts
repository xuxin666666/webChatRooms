import mysql from 'mysql2/promise'
import config from 'config'

import getUUID from '../pkg/uuid'
import Bcrypt from '../pkg/bcrypt'
import {ACreateUser, ACheckUserExist} from './user'

const { host, port, user, password, database, charset, connectionLimit } = config.get('mysql')


const connPool = mysql.createPool({
    user,
    password,
    host,
    port,
    database,
    charset,
    connectionLimit
})

const mysqlSetUp = () => new Promise((resolve: (value: void) => void, reject) => {
    connPool.getConnection()
        .then(conn => {
            console.logger('数据库连接成功')
            conn.release()
        })
        .catch(err => {
            console.logger(err, '数据库连接失败')
            reject(err)
        })
        .then(() => {
            return createOriginTables()
        })
        .then(() => {
            console.logger('初始表已创建')
            resolve()
        })
        .catch(err => {
            console.logger('createOriginTables', err)
            reject(err)
        })
})

// 数据库的初始化操作
const createOriginTables = () => new Promise((resolve: (value: void) => void, reject) => {
    let promise1 = connPool.execute(
        `create Table if NOT exists \`users\` (
            \`id\` INT NOT NULL AUTO_INCREMENT COMMENT '给用户用的标识',
            \`gender\` TINYINT DEFAULT 0 COMMENT '0：未知，1：男，2：女',
            \`message_alert\` TINYINT DEFAULT 0 COMMENT '是否开启消息提醒，0，1',
            \`message_system\` TINYINT DEFAULT 1 COMMENT '是否接收系统通知，0，1',
            \`system_message_read\` TINYINT DEFAULT 0 COMMENT '系统消息已读序号，与system_messages的id相对应',
            \`other_message_read\` TINYINT DEFAULT 1 COMMENT '其他消息是否已读，0，1',
            \`blocked_time\` BIGINT(13) DEFAULT 0 COMMENT '封号结束时间，时间戳，0表示未封号',
            \`last_online\` BIGINT(13) DEFAULT 0 COMMENT '上次登录时间，时间戳',
            \`birthday\` BIGINT(13) DEFAULT 0 COMMENT '生日',
            \`uid\` VARCHAR(50) NOT NULL collate utf8mb4_general_ci COMMENT '随机生成的用户id',
            \`username\` VARCHAR(20) NOT NULL collate utf8mb4_general_ci,
            \`password\` VARCHAR(100) NOT NULL collate utf8mb4_general_ci,
            \`email\` VARCHAR(20) NOT NULL collate utf8mb4_general_ci,
            \`avatar\` VARCHAR(50) DEFAULT 'defaultUser.png' collate utf8mb4_general_ci,
            \`role\` VARCHAR(20) DEFAULT 'normal' collate utf8mb4_general_ci COMMENT 'normal, admin, topAdmin',
            \`signature\` VARCHAR(100) DEFAULT 'Hello Word!' collate utf8mb4_general_ci COMMENT '个性签名',
            PRIMARY KEY(\`id\`)
        ) engine = InnoDB AUTO_INCREMENT = 100000001 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`
    )
    let promise2 = connPool.execute(
        `create Table if NOT exists \`groups\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`max_num\` INT DEFAULT 100 COMMENT '群管理最大人数',
            \`gid\` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
            \`name\` VARCHAR(20) NOT NULL collate utf8mb4_general_ci,
            \`description\` VARCHAR(1000) NOT NULL collate utf8mb4_general_ci,
            \`owner\` VARCHAR(50) NOT NULL collate utf8mb4_general_ci,
            \`admins\` VARCHAR(5000) default '' collate utf8mb4_general_ci COMMENT '管理员，uid，每个管理员用,隔开',
            \`avatar\` VARCHAR(50) DEFAULT 'defaultGroup.png' collate utf8mb4_general_ci,
            PRIMARY KEY(\`id\`)
        ) engine = InnoDB AUTO_INCREMENT = 500000001 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`
    )
    let promise3 = connPool.execute(
        `create Table if NOT exists \`system_messages\` (
            \`id\` INT NOT NULL AUTO_INCREMENT,
            \`create_time\` BIGINT(13) NOT NULL,
            \`message\` VARCHAR(100) NOT NULL collate utf8mb4_general_ci,
            PRIMARY KEY(\`id\`)
        ) engine = InnoDB AUTO_INCREMENT = 1 DEFAULT charset = utf8mb4 collate = utf8mb4_general_ci;`
    )
    Promise.all([promise1, promise2, promise3]).then(() => {
        ACheckUserExist({role: 'topAdmin'}).then((exist) => {
            if(!exist) {
                let uid = getUUID()
                return ACreateUser({
                    email: 'admin@qq.com',
                    password: Bcrypt.encrypt('12345678'),
                    username: 'admin',
                    uid,
                    role: 'topAdmin'
                })
            }
        })
    }).then(() => {
        resolve()
    }).catch(err => {
        console.logger('createOriginTables:', err)
        reject(err)
    })
})

/**
 * 事务处理，只能处理 update, delete, insert
 * @param {string[]} sqls 数据库操作语句
 * @param {any[][]} params 填充的参数
 */
function transaction(sqls: string[], params: any[]) {
    return new Promise((resolve, reject) => {
        // 参数不符
        if (sqls.length !== params.length) {
            return reject(new Error('语句数与参数数不匹配'))
        }

        connPool.getConnection()
            .then(conn => {
                // 开始执行事务
                conn.beginTransaction()
                    .then(() => {
                        // 根据sql语句生成 Promise 数组
                        let funcAry = sqls.map((sql, index) => {
                            return new Promise((sqlResolve, sqlReject) => {
                                let data = params[index];
                                conn.query(sql, data)
                                    .then(result => {
                                        // 操作成功
                                        sqlResolve(result);
                                    })
                                    .catch(err => {
                                        // 操作失败拒绝
                                        sqlReject(err);
                                    })
                            });
                        });

                        Promise.all(funcAry)
                            .then(result => {
                                conn.commit()
                                    .then(() => {
                                        conn.release()
                                        // 提交结果
                                        resolve(result)
                                    })
                                    .catch(err => {
                                        conn.rollback()
                                            .then(() => {
                                                conn.release()
                                                reject(err)
                                            })
                                            .catch(() => {
                                                conn.release()
                                                reject(err)
                                            })
                                    })
                            })
                            .catch(err => {
                                conn.rollback()
                                    .then(() => {
                                        conn.release();
                                        reject(err);
                                    })
                                    .catch(err => {
                                        conn.release();
                                        reject(err);
                                    })
                            })
                    })
                    .catch(err => {
                        // 失败直接释放连接并拒绝
                        conn.release()
                        reject(err)
                    })
            })
            .catch(err => {
                // 连接失败
                reject(err)
            })
    })
}

/**
 * 按顺序执行语句，上一个执行成功才执行下一个
 */
function runInOrder(sqls: string[], params: any[][]) {
    return new Promise(async (resolve: (result: any[]) => void, reject) => {
        if (sqls.length !== params.length) {
            return reject(new Error('语句数与参数数不匹配'))
        }
        let result = []
        for (let i = 0; i < sqls.length; i++) {
            let res = await connPool.query(sqls[i], params[i])
                .catch(err => {
                    reject(err)
                    return null
                })
            if (!res) return
            result.push(res)
        }
        resolve(result)
    })
}


// 程序退出时关闭与数据库的连接
process.on('exit', async (code) => {
    try {
        await connPool.end()
    } catch (err) {
        console.logger(err)
    }
})


export {
    connPool,
    mysqlSetUp,
    transaction,
    runInOrder
}
