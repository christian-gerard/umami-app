import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { ConfirmToast } from 'react-confirm-toast'
import { object, string } from 'yup'


function Profile() {
    const { user, removeUserData, updateUser } = useContext(UserContext)

	console.log(user)

    return (
		<>
		<div className='w-full h-[92%] flex justify-center items-center'>
			<div className='bg-champagne size-[70%] rounded-xl text-black text-base'>

				<div className='h-[10%] text-2xl flex items-end px-4 justify-between'>
					<p>Username: { user ? user.username : 'No Name'}</p>
					<p>Email: {user ? user.email : 'Email Not Listed'}</p>
				</div>

				<div className='h-[80%] bg-gray px-4'>

					<p>CookBook: {user.recipes.length !== 0 ? user.recipes.length : '0'} Recipes</p>

				</div>

				<div className='h-[10%]'>

				</div>

			</div>

		</div>




		</>


    )
}

export default Profile