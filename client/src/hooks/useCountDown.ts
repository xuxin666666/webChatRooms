import { useState, useEffect } from "react";

/**
 * 倒计时
 * @param beginValue 开始的时间，毫秒，>=0
 * @param callback 可选，回调函数，倒计时完成后调用，要立即调用可将beginValue设为一个小值，如1（ms）
 * @returns
 */
const useCountDown = (beginValue: number, callback?: Function): [number, (num: number) => void] => {
    const [timeRemain, setTimeRemain] = useState<number>(beginValue)

    useEffect(() => {
        if(timeRemain <= 0) return

        setTimeout(() => {
            if(timeRemain > 1000) setTimeRemain(timeRemain - 1000)
            else setTimeRemain(0)
        }, 1000)
    }, [timeRemain])

    useEffect(() => {
        if (timeRemain === 0 && typeof callback === 'function') {
            callback()
        }
    }, [timeRemain, callback])

    return [timeRemain, setTimeRemain]
}

export default useCountDown