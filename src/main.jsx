    import { StrictMode } from 'react'
    import { createRoot } from 'react-dom/client'
    import App from './App.jsx'
    import './index.css'
    import { SessionContextProvider } from '@supabase/auth-helpers-react'
    import { TaskProvider } from './contexts/taskcontext.jsx'
    import { supabase } from './lib/supabaseClient'

  // Add debug logs
  console.log('Supabase client initialized:', !!supabase)
  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.events',
      },
    })

  };

  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <SessionContextProvider 
      
        supabaseClient={supabase}
        initialSession={null}  // Explicitly set initial session
      >
        <TaskProvider>
          <App />
        </TaskProvider>
      </SessionContextProvider>
    </StrictMode>
  )