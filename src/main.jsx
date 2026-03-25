import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { FamilyProvider } from '@/contexts/FamilyContext';
import { Toaster } from 'sonner';
import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <AuthProvider>
      <FamilyProvider>
        <App />
        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#12121a',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
            },
          }}
        />
      </FamilyProvider>
    </AuthProvider>
  </BrowserRouter>
);
