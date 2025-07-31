  import { StrictMode } from 'react'
  import { createRoot } from 'react-dom/client'
  import App from './App.jsx'
  import './index.css'
  import { createClient } from '@supabase/supabase-js'
  import { SessionContextProvider } from '@supabase/auth-helpers-react'
  import { TaskProvider } from '@/contexts/taskcontext';

  const supabase = createClient(
    "https://oelqunglsskvxczyxdgp.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9lbHF1bmdsc3Nrdnhjenl4ZGdwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA2MzA0NzQsImV4cCI6MjA2NjIwNjQ3NH0.x1xtaWa3Oa4dTozmLsjqe0uz-FtqfjgWhhPei_AosSE"
  )

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