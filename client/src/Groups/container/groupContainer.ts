import { connect } from 'react-redux'
import { Socket } from 'socket.io-client'

import GroupMain from '../group'
import { setSocket } from '../../store/group/group'
import type { Dispatch } from '../../store'


const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        setSocket: (socket: Socket) => dispatch(setSocket(socket))
    }
}

const GroupContainer = connect(null, mapDispatchToProps)(GroupMain)

export type Dispatches = ReturnType<typeof mapDispatchToProps>
export default GroupContainer