import { Outlet } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Nav from './components/Nav'
import Footer from './components/Footer'
import './styles.css';


function App() {




  return (

      <main className='h-screen cormorant-garamond p-6 select-none "'>
        <Toaster
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
        <Nav />
        <Outlet />
        <Footer />
      </main>

  );
}

export default App;
