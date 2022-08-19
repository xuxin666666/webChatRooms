import React from 'react'
import { Image as Img } from 'antd'

import { imageUrl } from '../../config/config'
import noImg from '../../assert/images/404.png'


const Image: React.FC<{
    src: string
    alt?: string
    width?: string | number
    height?: string | number
    className?: string
    preview?: boolean
    [key: string]: any
}> = ({ src, alt = 'img', width, height, className, preview = false, ...other }) => {
    return (
        <Img
            src={imageUrl + src}
            fallback={noImg}
            preview={preview}
            alt={alt}
            width={width}
            height={height}
            className={className}
            {...other}
        />
    )
}

export default Image