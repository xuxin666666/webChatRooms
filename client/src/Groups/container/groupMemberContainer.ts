import { connect } from 'react-redux'

import {changeGroupInfo} from '../../store/group/group'
import GroupMember from '../groupMember'
import type { Dispatch } from '../../store'
import type {GroupChangeInfo} from '../../store/group/group'


const mapDispatchToProps = (dispatch: Dispatch) => {
    return {
        changeGroupInfo: (gid: string, info: GroupChangeInfo) => dispatch(changeGroupInfo({gid, info}))
    }
}

const GroupMemberContainer = connect(null, mapDispatchToProps)(GroupMember)

export type Dispatches = ReturnType<typeof mapDispatchToProps>

export default GroupMemberContainer