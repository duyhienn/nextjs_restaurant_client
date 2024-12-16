'use client'

import {
  checkAndRefreshToken,
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from '@/lib/utils'
import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import jwt, { JwtPayload } from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'

const UNAUTHENTICATED_PATHS = ['/login', '/register', 'refesh-token']
export default function RefreshToken() {
  const pathname = usePathname()

  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return
    let interval: any = null

    checkAndRefreshToken({
      onError: () => clearInterval(interval),
    })
    const TIME_INTERVAL = 1000
    interval = setInterval(checkAndRefreshToken, TIME_INTERVAL)
    return () => {
      clearInterval(interval)
    }
  }, [pathname])
  return <div>refresh-token</div>
}
