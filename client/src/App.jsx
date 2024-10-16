import './styles.css';
import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Nav from './components/Nav'
import Footer from './components/Footer'

function App() {

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
        <div className='h-[90%]'>
          <Nav />
          <Outlet />
        </div>
        <div className='h-[5%]'>
          <Footer />
        </div>
      </main>

  );
}

export default App;
