import fs from 'fs'
import path from 'path'
import formidable from 'formidable'
import express, { Request } from 'express'

// 给express添加3个函数
express.response.sendNoImage = function() {
    this.sendFile(__rootpath, 'assert/images/noImage.png')
}
express.response.sendAvatar = function(avatar: string) {
    let p = path.join(__rootpath, '../uploads/avatars', avatar)
    if(fs.existsSync(p)) this.sendFile(p)
    else this.sendNoImage()
}
express.response.sendImage = function(image: string) {
    let p = path.join(__rootpath, '../uploads/images', image)
    if(fs.existsSync(p)) this.sendFile(p)
    else this.sendNoImage()
}



const padNum = function (value: number, digits: number) {
    return Array(digits - value.toString().length + 1).join('0') + value
};
const getNewFileName = (name: any, ext: string) => {
    let date = new Date()
    let year = date.getFullYear(),
        month = padNum(date.getMonth() + 1, 2),
        day = padNum(date.getDate(), 2),
        hour = padNum(date.getHours(), 2),
        minute = padNum(date.getMinutes(), 2),
        second = padNum(date.getSeconds(), 2),
        milliSecond = padNum(date.getMilliseconds(), 3),
        random = (Math.random() * 100).toFixed(0)
    return year + month + day + hour + minute + second + milliSecond + '-' + random + ext
}

const formAvatar = new formidable.IncomingForm({
    uploadDir: path.join(__rootpath, '../uploads/avatars'),
    keepExtensions: true,
    filename: getNewFileName
})

const formImage = new formidable.IncomingForm({
    uploadDir: path.join(__rootpath, '../uploads/images'),
    keepExtensions: true,
    filename: getNewFileName
})



const saveAvatar = (req: Request) => new Promise((
    resolve: (value: {
        fields: formidable.Fields,
        files: formidable.Files
    }) => void,
    reject
) => {
    formAvatar.parse(req, (err, fields, files) => {
        if(err) reject(err)
        else {
            resolve({fields, files})
        }
    })
})

const saveImage = (req: Request) => new Promise((
    resolve: (value: {
        fields: formidable.Fields,
        files: formidable.Files
    }) => void,
    reject
) => {
    formImage.parse(req, (err, fields, files) => {
        if(err) reject(err)
        else {
            resolve({fields, files})
        }
    })
})

export {
    saveAvatar,
    saveImage,
    getNewFileName
}