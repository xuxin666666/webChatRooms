import { Request, Response } from 'express'
import path from 'path'

const MGetImage = async (req: Request, res: Response) => {
    try{
        let {type, image} = req.params
        
        if(type && image) {
            if(type === 'avatars') res.sendAvatar(image)
            else if(type === 'images') res.sendImage(image)
            return
        }
        res.sendNoImage()
    } catch(e) {
        res.status(500).end()
    }
}

const MPageNotFound = async (req: Request, res: Response) => {
    try {
        // const pathToIndex = path.join(__dirname, '../assert/index.html')
        // res.sendFile(pathToIndex);
        res.send('404')
    } catch (e) {
        res.status(500).end();
    }
}

export {
    MGetImage,
    MPageNotFound
}