'use client'

import RefreshToken from '@/components/refresh-token'
import { getAccessTokenFromLocalStorage, removeTokensFromLocalStorage } from '@/lib/utils'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useState, useContext, useEffect, useCallback } from 'react'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryOnMount: false,
    },
  },
})

const AppContext = createContext({
  isAuth: false,
  setIsAuth: (isAuth: boolean) => {},
})

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within a AppProvider')
  return context
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [isAuthState, setIsAuthState] = useState(false)
  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      setIsAuthState(true)
    }
  }, [])
  const setIsAuth = useCallback((isAuth: boolean) => {
    if (isAuth) {
      setIsAuthState(true)
    } else {
      setIsAuthState(false)
      removeTokensFromLocalStorage()
    }
  }, [])
  return (
    <AppContext.Provider value={{ isAuth: isAuthState, setIsAuth }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
