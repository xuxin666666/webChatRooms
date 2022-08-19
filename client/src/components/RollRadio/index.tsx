import React, { useRef, useEffect } from 'react'

import './index.scss'


const RollRadio: React.FC<{
    roll: boolean
    time?: number
    width?: number
    [key: string]: any
}> = ({roll, time = 600, width = 60, ...others}) => {
    
    const radio = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // document.styleSheets[0].addRule('.roll-radio::before', `transition: all ${time}ms ease`)
        (radio.current!.children[0] as HTMLElement).style.transition = `all ${time}ms ease`
    }, [time])

    useEffect(() => {
        radio.current!.style.width = `${width}px`
    }, [width])

    useEffect(() => {
        if(roll) radio.current?.classList.add('roll-radio-roll')
        else radio.current?.classList.remove('roll-radio-roll')
    }, [roll])

    return (
        <div className='roll-radio' ref={radio} {...others}>
            <div>🡤</div>
        </div>
    )
}

export default RollRadio