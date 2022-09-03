import React, {useEffect, useMemo, useState} from 'react'
import { Checkbox, Divider } from 'antd'
import type { CheckboxProps, CheckboxOptionType } from 'antd'
import type { CheckboxValueType } from 'antd/es/checkbox/Group';

import './index.scss'


export interface CheckboxGroupProps {
    defaultCheckedList?: CheckboxValueType[]
    checkAllName?: React.ReactNode
    dividerDirection?: 'vertical' | 'horizontal'
    onChange?: (list: CheckboxValueType[]) => void
    options: (CheckboxOptionType | string | number)[]
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({ 
    options, 
    defaultCheckedList = [], 
    checkAllName = '全选', 
    dividerDirection = 'vertical', 
    onChange = () => {} 
}) => {
    const [checkedList, setCheckedList] = useState<CheckboxValueType[]>(defaultCheckedList);
    const [indeterminate, setIndeterminate] = useState(Boolean(defaultCheckedList.length));
    const [checkAll, setCheckAll] = useState(false);

    const optionsValue = useMemo(() => {
        if(!options.length) return []
        return options.map(item => {
            if(typeof item === 'string' || typeof item === 'number') return item
            else return item.value
        })
    }, [options])

    useEffect(() => {
        if(checkedList.length === options.length) {
            setIndeterminate(false)
            setCheckAll(true)
        }
    }, [options, checkedList])

    const onCheckOneChange = (list: CheckboxValueType[]) => {
        setCheckedList(list);
        setIndeterminate(!!list.length && list.length < options.length);
        setCheckAll(list.length === options.length);
        onChange(list)
    };

    const onCheckAllChange: CheckboxProps['onChange'] = (e) => {
        let val = e.target.checked ? optionsValue : []

        setCheckedList(val);
        setIndeterminate(false);
        setCheckAll(e.target.checked);
        onChange(val)
    };

    return (
        <div className={`checkBoxGroup ${dividerDirection}`}>
            <Checkbox indeterminate={indeterminate} onChange={onCheckAllChange} checked={checkAll}>
                {checkAllName}
            </Checkbox>
            <Divider type={dividerDirection} className='divider' />
            <Checkbox.Group options={options} value={checkedList} onChange={onCheckOneChange} className='checks' />
        </div>
    )
}

export default CheckboxGroup