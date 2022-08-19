import { connect } from 'react-redux'

import GroupDetail from '../groupDetail'
import type { RootState } from '../../store'



const mapStateToProps = (state: RootState) => {
    return {
        socket: state.group.socket
    }
}


const GroupDetailContainer = connect(mapStateToProps)(GroupDetail)

export type States = ReturnType<typeof mapStateToProps>
export default GroupDetailContainer