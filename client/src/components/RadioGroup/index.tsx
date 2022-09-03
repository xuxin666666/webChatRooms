import React, {useMemo, useState} from 'react'
import { Radio, Divider } from 'antd'
import type { RadioGroupProps as rgps } from 'antd'

import './index.scss'


export interface RadioGroupProps {
    defaultChecked?: string | number
    name?: React.ReactNode
    dividerDirection?: 'vertical' | 'horizontal'
    onChange?: (val: string | number) => void
    options: NonNullable<rgps['options']>
}

const RadioGroup: React.FC<RadioGroupProps> = ({ 
    options, 
    defaultChecked, 
    name, 
    dividerDirection = 'vertical', 
    onChange = () => {} 
}) => {
    const valArr = useMemo(() => {
        if(!options.length) return []
        return options.map(item => {
            if(typeof item === 'string' || typeof item === 'number') return item
            else return item.value
        })
    }, [options])

    const [checked, setChecked] = useState(defaultChecked || valArr[0]);

    const onRadioGroupChange: rgps['onChange'] = (e) => {
        setChecked(e.target.value)
        onChange(e.target.value)
    }

    return (
        <div className={`radioGroup ${dividerDirection}`}>
            {
                name && (
                    <>
                        <span>{name}</span>
                        <Divider type={dividerDirection} className='divider' />
                    </>
                )
            }
            <Radio.Group options={options} value={checked} onChange={onRadioGroupChange} className='checks'>
            </Radio.Group>
        </div>
    )
}

export default RadioGroup