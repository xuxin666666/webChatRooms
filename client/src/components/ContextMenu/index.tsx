// 右键自定义菜单
import React, { useRef, useEffect, createContext, useState, useContext, Children, cloneElement } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'

import './index.scss'


interface HTMLDivItem extends HTMLDivElement {
    showAble?: boolean
}
interface ContextMenuProps {
    children: React.ReactNode
    items: MenuProps['items']
    defaultVisable?: boolean
    visible?: boolean
}
interface ContextMenuItemProps {
    children: React.ReactElement, 
    disabled?: boolean
}
interface ContextMenuType<P> extends React.FC<P> {
    Item: React.FC<ContextMenuItemProps>
}
function assertIsNode(e: EventTarget | null): asserts e is Node { }


// 创建context，保存数据
const ContextMenuContext = createContext({
    manual: false, // 是否人工
    addItem: (element: HTMLDivItem) => {} // 添加菜单项
})

// 内部的所有 ContextMenuItem 都作为菜单触发项
const ContextMenu: ContextMenuType<ContextMenuProps> = ({ items, children, defaultVisable = false, visible }) => {
    const [vis, setVis] = useState(defaultVisable)

    const menuRef = useRef<HTMLDivElement>(null) // 菜单栏的实例
    const menuItems = useRef<HTMLDivItem[]>([]) // 记录子菜单项
    const manual = useRef(typeof visible !== 'undefined') // 是否是人工操作


    const addItem = (element: HTMLDivItem) => {
        menuItems.current.push(element)
    }

    // 监听右键事件，控制菜单栏的位置和菜单栏的展示（如果不为人工）
    useEffect(() => {
        const onContextMenu = (e: MouseEvent) =>  {
            assertIsNode(e.target)
            
            if(menuRef.current?.contains(e.target)) {
                e.preventDefault()
                return       
            }
            if (manual.current) {
                menuRef.current!.style.left = e.pageX + 'px'
                menuRef.current!.style.top = e.pageY + 'px'
            } else {
                let flag = 0, flag2 = 0
                // 遍历子菜单项，判断是否包含点击位置
                for (let i = 0, len = menuItems.current.length; i < len; i++) {
                    if (menuItems.current[i]?.contains(e.target)) {
                        flag = 1
                        if (menuItems.current[i]?.showAble) {
                            flag2 = 1
                        }
                        break
                    }
                }
                if (flag) {
                    e.preventDefault();
                    if (flag2) {
                        menuRef.current!.style.left = e.pageX + 'px'
                        menuRef.current!.style.top = e.pageY + 'px'
                        setVis(true)
                    } else {
                        setVis(false)
                    }
                } else {
                    setVis(false)
                }
            }
        }
        window.addEventListener('contextmenu', onContextMenu)
        return () => {
            window.removeEventListener('contextmenu', onContextMenu)
        }
    }, [])

    // 监听点击事件，关闭菜单栏的展示
    useEffect(() => {
        function winClick() {
            setVis(false)
        }
        window.addEventListener('click', winClick)
        return () => {
            window.removeEventListener('click', winClick)
        }
    })

    return (
        <ContextMenuContext.Provider value={{ manual: manual.current, addItem }}>
            {children}
            {
                createPortal((
                    <div ref={menuRef} className='contextMenu' style={{
                        display: (manual.current ? visible : vis) ? 'block' : 'none'
                    }}>
                        <Menu
                            mode='vertical'
                            items={items}
                        />
                    </div>
                ), document.body)
            }
        </ContextMenuContext.Provider>
    )
}

// 子菜单项，要触发菜单栏的项用该组件包裹起来
const ContextMenuItem: React.FC<ContextMenuItemProps> = ({ children, disabled = false }) => {
    const { addItem, manual } = useContext(ContextMenuContext)

    const container = useRef<HTMLDivItem>(null)

    useEffect(() => {
        if (!disabled && !manual) {
            // Children.forEach(children, (child, index) => {
            //     if(index === 0) {
            //         // console.log(child)
            //         // addItem(child)
            //         child.ref = container
            //     }
            // })
            container.current!.showAble = true
        }
        addItem(container.current!)
    }, [addItem, manual, disabled])

    return (
        <>
            {Children.map(children, (child, index) => {
                if (index === 0) {
                    return cloneElement(child, {
                        ref: container
                    })
                }
                return child
            })}
        </>
    )
}

ContextMenu.Item = ContextMenuItem

export default ContextMenu