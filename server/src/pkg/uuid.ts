import uuid from 'node-uuid'

// 基于时间戳生成随机id
const getUUID = () => {
    return uuid.v1().replace(/-/g, '')
}

export default getUUID