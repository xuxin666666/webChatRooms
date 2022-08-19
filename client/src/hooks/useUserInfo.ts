import store from 'store'
import { useEffect, useState } from 'react'

export interface UserInfo {
    username: string
    avatar: string
    email: string
    messageAlertable: boolean
    uid: number
}

const defaultUserInfo = {
    username: '',
    avatar: '',
    email: '',
    messageAlertable: false,
    uid: 100000000
}

const useUserInfo = () => {
    const [userInfo, setUserInfo] = useState<UserInfo>(store.get('userInfo', defaultUserInfo))

    useEffect(() => {
        function changeUserInfo() {
            let changed = store.get('userInfo')
            setUserInfo(prev => ({
                username: changed.username || prev.username,
                avatar: changed.avatar || prev.avatar,
                email: changed.email || prev.email,
                uid: changed.uid || prev.uid,
                messageAlertable: changed.messageAlertable || prev.messageAlertable
            }))
        }
        window.addEventListener('userInfo', changeUserInfo)

        return () => {
            window.removeEventListener('userInfo', changeUserInfo)
        }
    }, [])

    return userInfo
}

export default useUserInfo