import { connect } from 'react-redux'

import {resetIndex, receivedNewMessage, beginConnect, clearTimer, setTimer, removeGroup, setCurrent} from '../../store/group/group'
import GroupsList from '../groupsList'
import type { Dispatch, RootState } from '../../store'



type Group = InferArray<RootState['group']['groups']>

const setAndRemoveTimer = (dispatch: Dispatch, callback: Function, prop: any) => {
    dispatch(clearTimer())
    dispatch(callback(prop))
    dispatch(setTimer(
        setTimeout(() => {
            dispatch(resetIndex())
        }, 10000)
    ))
}

const beginConnectAsync = (groups: Group[]) => {
    return (dispatch: Dispatch) => {
        setAndRemoveTimer(dispatch, beginConnect, groups)
    }
}

const receivedNewMessageAsync = (gid: string) => {
    return (dispatch: Dispatch) => {
        setAndRemoveTimer(dispatch, receivedNewMessage, gid)
    }
}

const mapStateToProps = (state: RootState) => {
    let {groups, socket, current} = state.group
    
    return { 
        groupState: {groups, socket, current }
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        beginConnect: (groups: Group[]) => {
            dispatch(beginConnectAsync(groups))
        },
        receivedNewMessage: (gid: string) => {
            dispatch(receivedNewMessageAsync(gid))
        },
        removeGroup: (gid: string) => dispatch(removeGroup(gid)),
        setCurrent: (gid: string) => dispatch(setCurrent(gid))
    }
}

const GroupListContainer = connect(mapStateToProps, mapDispatchToProps)(GroupsList)

export type States = ReturnType<typeof mapStateToProps>['groupState']
export type Dispatches = ReturnType<typeof mapDispatchToProps>
export default GroupListContainer