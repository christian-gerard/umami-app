import { createContext, useState, useEffect } from 'react'
import toast from 'react-hot-toast'

export const UserContext = createContext()

const UserProvider = ({children}) => {

    const [user, setUser] = useState(null)
    const login = (user) => setUser(user)
    const logout = () => {
          try {
              fetch('/logout', { method: 'DELETE' }).then((res) => {
                  if (res.status === 204) {
                      setUser(null)
                      toast.success('Logged Out')
                  } else {
                      toast.error('Something whent wrong while logging out. Please try again.')
                  }
              })
          } catch (err) {
              throw err
    }}
    const removeUserData = () => {
        try {
            fetch('/logout', { method: 'DELETE' }).then((res) => {
                if (res.status === 204) {
                    setUser(null)

                } else {

                }
            })
        } catch (err) {
            throw err
  }}

    const updateRecipes = (newRecipes) => {

      setUser({ ...user, recipes: newRecipes })

    }

    const updateUser = (newUser) => {
        setUser({ ...user, email: newUser.email, username: newUser.username })
    }

    useEffect(() => {
      fetch('/me')
      .then(resp => {
          if (resp.ok) {
          resp.json().then(setUser)

          } else {
          toast.error('Please log in')
          }
      })
  }, [])

  return (

    <UserContext.Provider value={{user, login, logout, updateRecipes, removeUserData, updateUser}}>
        {children}
    </UserContext.Provider>

  )


}


export default UserProvider