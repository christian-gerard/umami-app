import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { ConfirmToast } from 'react-confirm-toast'
import { object, string } from 'yup'


function Profile() {
    const { user, setUser, removeUserData, updateUser } = useContext(UserContext)

	const deleteUser = () => {
		fetch(`/api/v1/users/${user.id}`, {
			method: 'DELETE'
		})
		.then( res => {
			if(res.ok){
				removeUserData()
				nav('/')
				toast.success('User Deleted')
			} else {
				toast.error('Error: Unable to delete user')
			}
		})
	}

    return (
		<>
		<div className='w-full h-[92%] flex justify-center items-center'>
			<div className='bg-champagne size-[70%] rounded-xl text-black text-base'>

				<div className='h-[10%] text-2xl sm:text-2xl flex items-end px-4 justify-between'>
					<p>Username: { user ? user.username : 'No Name'}</p>
				</div>

				<div className='h-[80%] bg-shittake text-white px-4 text-lg p-2'>

					<p>Email: {user ? user.email : 'Email Not Listed'}</p>
					<p>Created at: {user ? user.created_at.slice(0,10) : 'Email Not Listed'}</p>
					<p>CookBook: {user.recipes.length !== 0 ? user.recipes.length : '0'} Recipes</p>

				</div>

				<div className='h-[10%] flex justify-center items-cente px-4 py-2'>
					<button className=' w-full bg-shittake text-white rounded-xl p-1' onClick={deleteUser}>Delete User</button>

				</div>

			</div>

		</div>




		</>


    )
}

export default Profile