'use client'

import { useAppContext } from '@/components/app-provider'
import { getAccessTokenFromLocalStorage, getRefreshTokenFromLocalStorage } from '@/lib/utils'
import { useLogoutMutation } from '@/queries/useAuth'
import { UseMutateAsyncFunction } from '@tanstack/react-query'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useRef } from 'react'

function Logout() {
  const { setRole } = useAppContext()
  const { mutateAsync, isSuccess } = useLogoutMutation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const refreshTokenFromUrl = searchParams.get('refreshToken')
  const accessTokenFromUrl = searchParams.get('accessToken')
  const ref = useRef<any>(null)
  useEffect(() => {
    if (
      !ref.current &&
      ((refreshTokenFromUrl && refreshTokenFromUrl === getRefreshTokenFromLocalStorage()) ||
        (accessTokenFromUrl && accessTokenFromUrl === getAccessTokenFromLocalStorage()))
    ) {
      ref.current = mutateAsync
      mutateAsync().then((res) => {
        if (res.status === 200) {
          setTimeout(() => {
            ref.current = null
          }, 1000)
          setRole(undefined)
          router.push('/login')
        }
      })
    } else {
      router.push('/')
    }
  }, [mutateAsync, router, refreshTokenFromUrl, accessTokenFromUrl, setRole])
  return <div>{isSuccess ? 'Log out....' : ''}</div>
}

export default function LogoutPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Logout />
    </Suspense>
  )
}
