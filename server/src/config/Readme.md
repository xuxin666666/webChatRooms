## 配置文件
### default.json
```json
{
    "version": "",
    "server": {
        "hostname": "",
        "port": 0
    },
    "client": "", // 客户端网址，用来设置socket的cors
    "env": "development", // 环境：开发环境，生产环境
    "email" : { // 发邮件的配置
        "host": "",
        "port": 0,
        "user": "",
        "pass": "" // 授权码
    }
}
```
### development.json
```json
{
    "mysql": { // 数据库相关
        "host": "",
        "port": 0,
        "user": "",
        "password": "",
        "charset": "",
        "database": "",
        "connectionLimit": 50 // 最大连接数
    }
}
```
### production.json