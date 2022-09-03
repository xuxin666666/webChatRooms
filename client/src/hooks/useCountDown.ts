import { useState, useEffect, useRef, useCallback } from "react";

/**
 * 倒计时
 * @param beginValue 开始的时间，毫秒，>=0
 * @param callback 可选，回调函数，倒计时完成后调用，要立即调用可将beginValue设为一个小值，如1（ms）
 * @returns
 */
const useCountDown = (beginValue: number, callback?: Function): [number, (num: number) => void] => {
    const [timeRemain, setTimeRemain] = useState<number>(beginValue)

    const timer = useRef<NodeJS.Timer>()
    const t = useRef(Date.now()) // 记录时间,用来补偿setTimeout的误差

    // 单纯用setTimeout来倒计时
    // 不用useEffect，不然不仅误差更大（不补偿的话），而且页面切到后台时，误差更是非常的大
    const count = useCallback(() => {
        timer.current = setTimeout(() => {
            t.current += 1000
            setTimeRemain(prev => {
                if(prev > 1000) {
                    count() // 满足条件则接着进行
                    return prev - 1000
                } else return 0
            })
        }, 1000 - (Date.now() - t.current)) // 误差补偿
    }, [])

    // 开始时自动倒计时,后续是通过setTime倒计时
    const setTime = useCallback((num: number) => {
        // 清除之前的倒计时
        clearTimeout(timer.current)
        setTimeRemain(num)
        t.current = Date.now() // 设置t用于误差补偿
        count() // 开始倒计时
    }, [count])

    // 开始时自动倒计时,后续是通过setTime倒计时
    useEffect(() => {
        count()
    }, [count])

    useEffect(() => {
        if (timeRemain === 0 && typeof callback === 'function') {
            callback()
        }
    }, [timeRemain, callback])

    return [timeRemain, setTime]
}

export default useCountDown