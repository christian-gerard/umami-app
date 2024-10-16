import { createBrowserRouter } from 'react-router-dom'
import App from '../App'
import Error from './Error'
import Auth from '../components/Auth'
import Recipe from '../pages/recipes/Recipe'
import FindRecipe from '../pages/recipes/FindRecipe'
import Cookbook from '../pages/recipes/Cookbook'
import Profile from '../pages/profile/Profile'


const router = createBrowserRouter([
	{
		path: '/',
		element: <App />,
		errorElement: <Error />,
		children: [
            {
                path: '/',
                element: <Auth />,
            },
            {
                path: '/findrecipes',
                element: <FindRecipe />,
            },
            {
                path: '/cookbook',
                element: <Cookbook />,
            },
            {
                path: '/recipes/:id',
                element: <Recipe />
            },
            {
                path: '/profile',
                element: <Profile />
            }

		]
	}
])

export default router