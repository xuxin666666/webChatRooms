import React from 'react'
import { createPortal } from 'react-dom'

interface PortalsType {
    className?: string
    [key: string]: any
}

const Portals: React.FC<PortalsType> = ({className, children, ...others}) => {

    return createPortal(
        <div className={className} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        }} {...others}>
            {children}
        </div>,
        document.body
    )
}

export default Portals