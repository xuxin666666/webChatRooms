import React, { useEffect, useRef, useState } from 'react'

import './index.scss'


const front: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    return (
        <div className='card-front'>
            <div className='center-wrap'>
                {children}
            </div>
        </div>
    )
}

const back: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    return (
        <div className='card-back'>
            <div className='center-wrap'>
                {children}
            </div>
        </div>
    )
}

type Direction = 'toLeft' | 'toRight'

interface Card3dWrapProps {
    children: React.ReactNode
    wrap:  any
    direction: Direction
    time?: number
    width?: number
    height?: number
}

interface Card3dWrapType<P> extends React.FC<P> {
    Front: typeof front;
    Back: typeof back;
}

/**
 * wrap 换成不同的值即可使得卡片转向
 * @returns 
 */
const Card3dWrap: Card3dWrapType<Card3dWrapProps> = ({ children, wrap, direction = 'toRight', time = 600, width = 400, height = 400 }) => {
    const [deg, setDeg] = useState(0)

    const first = useRef(true)
    const direct = useRef<Direction>('toRight')
    

    useEffect(() => {
        direct.current = direction
    }, [direction])

    useEffect(() => {
        if(first.current) {
            first.current = false
            return
        }
        if (direct.current) setDeg(prev => prev + 180)
        else setDeg(prev => prev - 180)
    }, [wrap])

    return (
        <div className='card-3d-wrap' style={{width, height}}>
            <div className='card-3d-wrapper' style={{
                transition: `all ${time}ms ease-out`,
                transform: `rotateY(${deg}deg)`,
            }}>
                {children}
            </div>
        </div>
    )
}

Card3dWrap.Front = front
Card3dWrap.Back = back


export default Card3dWrap