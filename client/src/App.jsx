import './styles.css';
import { useContext } from 'react'
import { UserContext } from './context/UserContext'
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Nav from './components/Nav'
import Auth from './components/Auth'
import Footer from './components/Footer'

function App() {
  const { user } = useContext(UserContext)

  return (

      <main className='h-screen font-cormorant select-none'>
        <Toaster
          className='bg-shittake'
          position='top-center'
          containerClassName='toaster-style'
          toastOptions={{
            success: {
              style: {
                background: '#F7E7CE',
                color: 'black'
              },
              iconTheme: {
                primary: '#D3D3D3',
                secondary: '#71373B'
              },
            },
            error: {
              iconTheme: {
                primary: '#D3D3D3',
                secondary: '#71373B'
              },
              style: {
                background: '#F7E7CE',
                color: '#71373B',
              },
            },
          }}
        />
        <div className='h-[95%]'>
          <Nav />
          {user ? <Outlet /> : <Auth />}
        </div>
        <div className='h-[5%]'>
          <Footer />
        </div>
      </main>

  );
}

export default App;
