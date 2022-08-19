import bcrypt from 'bcrypt'

class Bcrypt {
    static encrypt(data: string) {
        let salt = bcrypt.genSaltSync(10)
        return bcrypt.hashSync(data, salt)
    }

    static verify(data: string, saltData: string) {
        return bcrypt.compareSync(data, saltData)
    }
}

export default Bcrypt