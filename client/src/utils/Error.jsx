import { useContext } from 'react'
import { NavLink } from 'react-router-dom'
import { UserContext } from '../context/UserContext'

function Error() {

    const { user } = useContext(UserContext)
    return (
        <div className='border bg-shittake flex justify-center flex-col m-10 text-white text-4xl rounded-xl p-2 cormorant-garamond '>
            <p className='flex justify-center m-10'>Something went wrong... 🤔</p>
            <NavLink to={user ? '/cookbook' : '/'} className='rounded-xl text-black bg-champagne hover:text-shittake  flex justify-center m-10 italic'>Return Home</NavLink>
        </div>
    )
}

export default Error