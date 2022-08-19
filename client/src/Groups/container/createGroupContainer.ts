import { connect } from 'react-redux'

import {resetIndex, clearTimer, setTimer, addGroup, setCurrent} from '../../store/group/group'
import CreateGroup from '../createGroup'
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

const addGroupAsync = (group: Group) => {
    return (dispatch: Dispatch) => {
        setAndRemoveTimer(dispatch, addGroup, group)
    }
}

const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        addGroup: (group: Group) => dispatch(addGroupAsync(group)),
        setCurrent: (gid: string) => dispatch(setCurrent(gid))
    }
}

const CreateGroupContainer = connect(null, mapDispatchToProps)(CreateGroup)

export type Dispatches = ReturnType<typeof mapDispatchToProps>

export default CreateGroupContainer