import React, { useRef, useEffect, useState } from 'react'

import './scss/scrollBar.scss'


const ExistTime = 2000
const ScrollBar: React.FC = () => {
    // 控制滑块的高度和位置
    const [offsetTop, setOffsetTop] = useState(0) // 滑块距离顶部的位置
    const [thumbHeight, setThumbHeight] = useState(0) // 滑块的高度
    const [screenHeight, setScreenHeight] = useState(document.documentElement.clientHeight)
    const [totalHeight, setTotalHeight] = useState(document.documentElement.scrollHeight)

    // 控制滑块的显示
    const [vis, setVis] = useState(false)

    const contentRef = useRef<HTMLIFrameElement>(null);
    const timer = useRef<NodeJS.Timer>()

    // 更新屏幕高度
    useEffect(() => {
        function resize() {
            setScreenHeight(document.documentElement.clientHeight)
        }
        window.addEventListener('resize', resize)

        return () => {
            window.removeEventListener('resize', resize)
        }
    }, [])

    // 更新页面总高度
    useEffect(() => {
        // console.log(2);
        contentRef.current!.contentWindow!.onresize = function (e) {
            setTotalHeight(document.documentElement.scrollHeight)
        }
    }, []);

    useEffect(() => {
        function scroll() {
            clearTimeout(timer.current)
            setVis(true)
            timer.current = setTimeout(() => {
                setVis(false)
            }, ExistTime)

            setOffsetTop(document.documentElement.scrollTop / document.documentElement.scrollHeight * document.documentElement.clientHeight)
        }
        window.addEventListener('scroll', scroll)

        return () => {
            window.removeEventListener('scroll', scroll)
        }
    }, [])

    useEffect(() => {
        clearTimeout(timer.current)

        if (screenHeight === totalHeight) {
            setThumbHeight(0)
            setVis(false)
        } else {
            setVis(true)
            timer.current = setTimeout(() => {
                setVis(false)
            }, ExistTime)

            setThumbHeight(screenHeight * screenHeight / totalHeight)
        }
    }, [screenHeight, totalHeight])

    return (
        <>
            <iframe ref={contentRef} className='iframe'></iframe>
            <div className='scrollBar'>
                <div className='thumb' style={{
                    height: thumbHeight,
                    top: offsetTop,
                    visibility: vis ? 'visible' : 'hidden'
                }}></div>
            </div>
        </>
    )
}

export default ScrollBar