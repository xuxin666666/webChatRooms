import {configureStore} from '@reduxjs/toolkit'

import groupReducer from './group/group'


const store = configureStore({
    reducer: {
        group: groupReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['groupSlice/setSocket'],
                ignoredPaths: ['group.socket']
            }
        })
})


export type RootState = ReturnType<typeof store.getState>
export type Dispatch = typeof store.dispatch


export default store