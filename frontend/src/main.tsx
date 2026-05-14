import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { AuthProvider } from '@/contexts/auth-context'
import './i18n'
import './styles/globals.css'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="bpsc-ui-theme">
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
