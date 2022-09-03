import React, { useState, useEffect, useCallback } from 'react'
import { Collapse } from 'antd'

import { MenuDynamicOutlined } from '../Icons'

import './index.scss'


const FilterContainer: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [drop, setDrop] = useState(false)

    const filterClick: React.MouseEventHandler = useCallback(() => {
        setDrop(prev => !prev)
    }, [])

    return (
        <Collapse className='filterContainer' bordered={false} activeKey={[Number(drop)]}>
            <Collapse.Panel
                key={1}
                header='筛选'
                showArrow={false}
                collapsible='disabled'
                extra={<MenuDynamicOutlined className='filterMenu' onClick={filterClick} defaultActive={false} />}
                className='filterPanel'
            >
                <div className='filterContent'>
                    {children}
                </div>
            </Collapse.Panel>
        </Collapse>
    )
}

export default FilterContainer