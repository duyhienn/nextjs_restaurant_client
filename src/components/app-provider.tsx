'use client'

import RefreshToken from '@/components/refresh-token'
import { deocodeToken, getAccessTokenFromLocalStorage, removeTokensFromLocalStorage } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createContext, useState, useContext, useEffect, useCallback } from 'react'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retryOnMount: false
    }
  }
})

const AppContext = createContext({
  isAuth: false,
  role: undefined as RoleType | undefined,
  setRole: (role?: RoleType | undefined) => {}
})

export const useAppContext = () => {
  const context = useContext(AppContext)
  if (!context) throw new Error('useAppContext must be used within a AppProvider')
  return context
}

export default function AppProvider({ children }: { children: React.ReactNode }) {
  const [roleState, setRoleState] = useState<RoleType | undefined>(undefined)
  useEffect(() => {
    const accessToken = getAccessTokenFromLocalStorage()
    if (accessToken) {
      const role = deocodeToken(accessToken).role
      setRoleState(role)
    }
  }, [])
  const setRole = useCallback((role?: RoleType | undefined) => {
    setRoleState(role)
    if (!role) {
      removeTokensFromLocalStorage()
    }
  }, [])

  const isAuth = Boolean(roleState)
  return (
    <AppContext.Provider value={{ isAuth, role: roleState, setRole }}>
      <QueryClientProvider client={queryClient}>
        {children}
        <RefreshToken />
      </QueryClientProvider>
    </AppContext.Provider>
  )
}
