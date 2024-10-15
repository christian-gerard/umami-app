import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { UserContext } from '../../context/UserContext'
import { useFormik } from 'formik'
import toast from 'react-hot-toast'
import { ConfirmToast } from 'react-confirm-toast'
import { object, string } from 'yup'


function Profile() {
    const { user, removeUserData, updateUser } = useContext(UserContext)
    const [editMode, setEditMode] = useState(false)
    const nav = useNavigate()
    const handleEdit = () => {
        console.log("EDIT")
        setEditMode(!editMode)
    }

    const handleDelete = () => {
        fetch(`/users/${user.id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then((res) => {
			if (res.ok) {
				removeUserData()
				nav('/')
				toast.success("Account Deleted")
			} else {
				return res
					.json()
					.then((errorObj) => toast.error(errorObj.message))
			}
		})
		.catch((error) => console.error('Error:', error))
        
    }


    const recipeSchema = object({
        name: string(),
        steps: string()
    })

    const initialValues = {
        username: user?.username,
        email: user?.email
    }

	const formik = useFormik({
		initialValues,
		validationSchema: recipeSchema,
		onSubmit: (formData) => {
			fetch(`/users/${user.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					username: formData.username,
					email: formData.email
				})
			})
				.then((res) => {
					if (res.ok) {
						return res.json().then((data) => {
							updateUser(data)
							setEditMode(false)
							toast.success("User Updated")
						})
					} else {
						return res
							.json()
							.then((errorObj) => toast.error(errorObj.message))
					}
				})
		}
	})


    return (

        <div className='text-lg bg-shittake text-white  p-6 flex flex-col rounded-lg border mt-6'>

            <h1 className='text-2xl font-bold m-1'>Profile</h1>

			{ user ? 
				<>
					<h1 className='m-1'>{user.username}</h1>

					<h3 className='m-1'>{user.email}</h3>

					<p>CookBook Size: {user.recipes.length}</p>
				
				</>

				:
				<></>
		
		
			}


            <button className=' bg-champagne text-black rounded-lg hover:text-shittake p-1 m-2 mt-3 ' onClick={handleEdit}>EDIT</button>
			<div className='bg-gray text-black flex justify-center rounded-lg hover:text-shittake p-1 m-2 '>

				<ConfirmToast
						
						asModal={true}
						customCancel={'Cancel'}
						customConfirm={'Delete'}
						customFunction={handleDelete}
						message={'Deleting a user will delete all associated recipes and cookbooks. Are you sure you want to continue?'}
						position={'top-left'}
						showCloseIcon={false}

				>

				DELETE ACCOUNT

				</ConfirmToast>

			</div>

            {
                    editMode ? 
                    <div className='fixed inset-0 flex justify-center items-center transition-colors backdrop-blur '> 

						<form className=' bg-white p-12  flex flex-col text-lg text-black rounded-xl border-2 border-shittake w-[500px]' onSubmit={formik.handleSubmit}>
							<button className='bg-shittake text-white rounded-xl 'type='button' onClick={() => setEditMode(!editMode)} >X</button>
								<label className='text-black' htmlFor='name'>User Name</label>
								<input
									type='text'
									name='username'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.username}
									className='border rounded-lg m-1 p-1'
									placeholder={user.username}
								/>
								{formik.errors.username && formik.touched.username && (
									<div className='error-message show'>{formik.errors.username}</div>
								)}

								<label className='text-black' htmlFor='steps'>Email</label>
								<input
									type='text'
									name='email'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.email}
									className='border rouned-lg m-1 p-1'
									placeholder={user.email}
								/>
								{formik.errors.steps && formik.touched.email && (
									<div className='error-message show'>{formik.errors.email}</div>
								)}

								{/* <label htmlFor='ingredients'>Ingredients</label>
								<input
									type='text'
									name='ingredients'
									onChange={formik.handleChange}
									onBlur={formik.handleBlur}
									value={formik.values.ingredients}
									id = 'steps'
									placeholder={currentRecipe.steps}
								/>
								{formik.errors.ingredients && formik.touched.ingredients && (
									<div className='error-message show'>{formik.errors.ingredients}</div>
								)} */}

								<button className='bg-shittake text-white rounded-lg m-1 p-1'>
									Update Profile
								</button>
						</form>


					</div>
                    
                    : 
                    
                    <></>
                    
                }

        </div>

    )
}

export default Profile