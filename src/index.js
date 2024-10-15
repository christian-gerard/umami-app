import {  RouterProvider } from 'react-router-dom'
import ReactDOM from 'react-dom/client';
import router from './utils/routes'
import UserProvider from './context/UserContext';


const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <UserProvider>
        <RouterProvider router={router} />
    </UserProvider>
);



