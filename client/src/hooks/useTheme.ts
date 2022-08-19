import { useEffect, useState } from 'react'
import store from 'store'

type Theme = 'dark' | 'light'

const useTheme: () => [theme: Theme, changeTheme: () => void] = () => {
    const [theme, setTheme] = useState<Theme>(store.get('theme', 'dark'))

    useEffect(() => {
        store.set('theme', theme)

        let body = document.body
        if(theme === 'dark') {
            body.classList.remove('light-theme')
            body.classList.add('dark-theme')
        } else {
            body.classList.remove('dark-theme')
            body.classList.add('light-theme')
        }
    }, [theme])

    const changeTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark')
    }

    return [theme, changeTheme]
}

export default useTheme