import React, { Fragment, lazy } from 'react'
import { Link, Route, Routes, Navigate } from 'react-router-dom'
import { Result, Button } from 'antd'


const Groups = lazy(() => import('../Groups'))
const Personal = lazy(() => import('../Personal'))
const Admin = lazy(() => import('../Admin'))

const Home: React.FC = () => {

    return (
        <Fragment>
            <Routes>
                <Route path='/group' element={<Navigate to='/groups' replace />} />
                <Route path='/person' element={<Navigate to='/person/profile' replace />} />
                <Route path='/admin' element={<Navigate to='/admin/person' replace />} />

                <Route path='/admin/*' element={<Admin />} />
                <Route path='/groups/*' element={<Groups />} />
                <Route path='/person/*' element={<Personal />} />
                <Route path='*' element={(
                    <Result
                        className='pageNotFound'
                        status='404'
                        title="404"
                        subTitle="页面不存在"
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
