import { NavLink, useNavigate } from 'react-router-dom'
import { useContext, useState } from 'react'
import { UserContext } from '../context/UserContext'

function Nav () {
    const {user, logout} = useContext(UserContext)
    const [viewMenu, setViewMenu] = useState(false)

    const handleMenu = () => {
        setViewMenu(!viewMenu)
    }
    return (
        <>
            {
                user ?

                <div onClick={handleMenu} className='text-4xl text-white sticky rounded-xl p-2 top-0 left-0 right-0 flex flex-row tracking-widest items-end  '>
                <div onClick={handleMenu} className='text-4xl text-white sticky flex flex-col md:flex-row bg-shittake rounded-xl p-6 top-0 left-0 right-0 flex flex-row tracking-widest items-end  '>

                <h1 className='text-3xl md:text-5xl hover:text-champagne tracking-[0.25em] ' >UMAMI</h1>

                {viewMenu ?

                <div className='text-sm flex flex-col md:text-xl md:flex-row pl-3 '>
                        <NavLink id='link' to='/cookbook' className='hover:text-champagne  m-2 italic' > Cookbook </NavLink>
                        <NavLink id='link' to='/findrecipes' className='hover:text-champagne m-2 italic' > AI Recipes </NavLink>
                        <NavLink id='link' to='/profile' className='hover:text-champagne m-2 italic'  > Profile </NavLink>
                        <NavLink id='link' to='/' className='hover:text-champagne m-2 italic' onClick={logout} > Logout </NavLink>
                </div>


:
<></>
                }

                </div>
                </div>
            :
            <>
                </>
         }


         </>
    )
}

export default Nav