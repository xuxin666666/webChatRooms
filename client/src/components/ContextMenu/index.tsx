// 右键自定义菜单
import React, { useRef, useEffect, createContext, useState, useContext, Children, cloneElement, memo } from 'react'
import { createPortal } from 'react-dom'
import { Menu } from 'antd'
import type { MenuProps } from 'antd'

import './index.scss'


interface ContextMenuProps {
    children: React.ReactNode
}
interface TheMenuProps {
    items: MenuProps['items']
    defaultVisable?: boolean
    visible?: boolean
}
interface ContextMenuItemProps {
    children: any,
    disabled?: boolean
}
interface ContextMenuType<P> extends React.FC<P> {
    Item: React.FC<ContextMenuItemProps>
    ContextMenu: React.FC<TheMenuProps>
}
function assertIsNode(e: EventTarget | null): asserts e is Node { }


// 创建context，保存数据
const ContextMenuContext = createContext<{
    manual: React.MutableRefObject<boolean>
    menuItems: React.MutableRefObject<HTMLDivElement[]>
}>({
    manual: { current: false }, // 是否人工
    menuItems: { current: [] }
})


const TheMenu: React.FC<TheMenuProps> = ({ items, defaultVisable = false, visible }) => {
    const [vis, setVis] = useState(defaultVisable)

    const menuRef = useRef<HTMLDivElement>(null) // 菜单栏的实例
    const mm = useRef(false) // 防止后续还出发是否人工操作的验证

    const { menuItems, manual } = useContext(ContextMenuContext)

    useEffect(() => {
        if (!mm.current && typeof visible !== 'undefined') {
            manual.current = true
            mm.current = true
        }
    }, [visible])

    // 监听右键事件，控制菜单栏的位置和菜单栏的展示（如果不为人工）
    useEffect(() => {
        const onContextMenu = (e: MouseEvent) => {
            assertIsNode(e.target)

            if (menuRef.current?.contains(e.target)) {
                e.preventDefault()
                return
            }

            let flag = 0
            // 遍历子菜单项，判断是否包含点击位置
            for (let i = 0, len = menuItems.current.length; i < len; i++) {
                if (menuItems.current[i]?.contains(e.target)) {
                    flag = 1
                    break
                }
            }
            if (flag) {
                e.preventDefault();
                menuRef.current!.style.left = e.pageX + 'px'
                menuRef.current!.style.top = e.pageY + 'px'
                setVis(true)
            } else {
                setVis(false)
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
        <>
            {
                createPortal((
                    <div ref={menuRef} className='contextMenu' style={{
                        display: vis ? 'block' : 'none'
                    }}>
                        <Menu
                            mode='vertical'
                            items={items}
                        />
                    </div>
                ), document.body)
            }
        </>
    )
}

// 内部的所有 ContextMenuItem 都作为菜单触发项
// 把菜单显示部分分离出去，防止一些无用的重新渲染
const ContextMenu: ContextMenuType<ContextMenuProps> = ({ children }) => {

    const menuItems = useRef<HTMLDivElement[]>([]) // 记录子菜单项
    const manual = useRef(false) // 是否是人工操作

    return (
        <ContextMenuContext.Provider value={{ manual: manual, menuItems }}>
            {children}
        </ContextMenuContext.Provider>
    )
}


// 子菜单项，要触发菜单栏的项用该组件包裹起来
const ContextMenuItem: React.FC<ContextMenuItemProps> = memo(({children, disabled = false}) => {
    const { menuItems, manual } = useContext(ContextMenuContext)

    const container = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (!disabled && !manual.current) {
            menuItems.current.push(container.current!)
        }
    }, [manual.current, disabled])

    return (
        <>
            {Children.map(children, (child, index) => {
                if (index === 0) {
                    return cloneElement(child, {
                        ref: (node: any) => {
                            // 获取元素的实例，同时保证原有的对实例的获取
                            container.current = node
                            if (child.ref) {
                                child.ref.current = node
                            }
                        }
                    })
                }
                return child
            })}
        </>
    )
})

ContextMenu.Item = ContextMenuItem
ContextMenu.ContextMenu = TheMenu

export default ContextMenu