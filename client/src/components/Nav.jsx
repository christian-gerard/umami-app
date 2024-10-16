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
                <>
                <div className={`h-[8%] bg-shittake text-lg text-white flex flex-col sm:flex-row ${viewMenu ? '' : 'rounded-b-lg'} pb-2`}>
                    <p onClick={handleMenu} className='text-3xl hover:text-champagne tracking-[0.25em] h-full flex items-end px-6'>UMAMI</p>
                    <div className='hidden sm:flex flex-row gap-x-4 italic tracking-widest flex items-end'>
                                <NavLink id='link' to='/cookbook' className='hover:text-champagne' > Cookbook </NavLink>
                                <NavLink id='link' to='/findrecipes' className='hover:text-champagne' > AI Recipes </NavLink>
                                <NavLink id='link' to='/profile' className='hover:text-champagne'  > Profile </NavLink>
                                <NavLink id='link' to='/' className='hover:text-champagne' onClick={logout} > Logout </NavLink>
                    </div>
                </div>
                {viewMenu && (

                    <div className='sm:hidden flex flex-col bg-shittake text-white z-10 gap-4 italic tracking-widest pl-6 pb-2 rounded-b-lg'>
                            <NavLink id='link' to='/cookbook' className='hover:text-champagne' > Cookbook </NavLink>
                            <NavLink id='link' to='/findrecipes' className='hover:text-champagne' > AI Recipes </NavLink>
                            <NavLink id='link' to='/profile' className='hover:text-champagne'  > Profile </NavLink>
                            <NavLink id='link' to='/' className='hover:text-champagne' onClick={logout} > Logout </NavLink>
                    </div>

                )}
                </>
            :
            <>
            </>
            }
        </>
    )
}

export default Nav