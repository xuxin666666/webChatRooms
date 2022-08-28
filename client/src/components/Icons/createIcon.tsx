import React from 'react'
import Icon from '@ant-design/icons'

export interface IconOutlined {
    className?: string
    onClick?: React.MouseEventHandler
    [key: string]: any
}

const createIcon = (svg: JSX.Element): React.FC<IconOutlined> => {
    return (props) => {
        return (
            <Icon
                component={() => (svg)}
                {...props}
            />
        )
    }
}

export default createIcon