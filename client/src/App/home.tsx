import React, { Fragment, lazy } from 'react'
import { Link, Route, Routes, Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'


const Groups = lazy(() => import('../Groups'))
const Personal = lazy(() => import('../Personal'))

const Home: React.FC = () => {

    return (
        <Fragment>
            <Routes>
                <Route path='/group' element={<Navigate to='/groups' replace />} />
                <Route path='/person' element={<Navigate to='/person/profile' replace />} />

                <Route path='/groups/*' element={<Groups />} />
                <Route path='/person/*' element={<Personal />} />
                <Route path='*' element={(
                    <Result
                        status='404'
                        title="404"
                        subTitle="Sorry, the page you visited does not exist."
                        extra={
                            <Button type="primary">
                                <Link to='/groups'>返回主页</Link>
                            </Button>
                        }
                    />
                )} />
            </Routes>
        </Fragment>
    )
}

export default Home
