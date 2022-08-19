import jsonwebtoken from 'jsonwebtoken'

const mySecret = '永夜不坠 | FATAL ERROR'

class JWT {
    static generate(data: {uid: string}, expiration='2d') {
        const token = jsonwebtoken.sign(data, mySecret, {expiresIn: expiration})
        return token
    }
    static verify(token: string): {uid: string} | false {
        try {
            return (jsonwebtoken.verify(token, mySecret) as any)
        } catch (err) {
            console.logger('JWT, verify error:', err)
            return false
        }
    }
}

export default JWT
