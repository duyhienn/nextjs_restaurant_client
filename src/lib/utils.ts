import { toast } from '@/hooks/use-toast'
import { EntityError } from '@/lib/http'
import { type ClassValue, clsx } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import jwt, { JwtPayload } from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'

const isBrowser = typeof window !== 'undefined'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Remove the first character of the path if it is `/`
 */
export const normalizePath = (path: string) => {
  return path.startsWith('/') ? path.slice(1) : path
}

/**
 * Handle error from api (included EntityError 422)
 * @param error Error from api
 * @param setError React Hook Form's setError function
 * @param duration Duration of toast
 */
export const handleErrorApi = ({
  error,
  setError,
  duration,
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message,
      })
    })
  } else {
    toast({
      title: 'Error',
      description: error?.payload?.message ?? 'Unknown error',
      variant: 'destructive',
      duration: duration ?? 2000,
    })
  }
}

/**
 * Get access token from localStorage
 * @returns Access token
 */
export const getAccessTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem('accessToken') : null
}

/**
 * Get refresh token from localStorage
 * @returns Refresh token
 */
export const getRefreshTokenFromLocalStorage = () => {
  return isBrowser ? localStorage.getItem('refreshToken') : null
}

/**
 * Set access token to localStorage
 * @param accessToken Access token
 */
export const setAccessTokenToLocalStorage = (accessToken: string) => {
  return isBrowser ? localStorage.setItem('accessToken', accessToken) : null
}

/**
 * Set refresh token to localStorage
 * @param refreshToken Refresh token
 */
export const setRefreshTokenToLocalStorage = (refreshToken: string) => {
  return isBrowser ? localStorage.setItem('refreshToken', refreshToken) : null
}

export const removeTokensFromLocalStorage = () => {
  if (isBrowser) {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
  }
}

/**
 * Check and refresh token
 * @param params 2 Callback functions: onError and onSuccess
 */
export const checkAndRefreshToken = async (params?: { onError?: () => void; onSuccess?: () => void }) => {
  const accessToken = getAccessTokenFromLocalStorage()
  const refreshToken = getRefreshTokenFromLocalStorage()
  if (!accessToken || !refreshToken) return
  const decodedAccessToken = jwt.decode(accessToken) as JwtPayload
  const decodedRefreshToken = jwt.decode(refreshToken) as JwtPayload

  const now = new Date().getTime() / 1000 - 1

  if (decodedRefreshToken.exp! <= now) {
    removeTokensFromLocalStorage()
    return params?.onError && params.onError()
  }

  if (decodedAccessToken.exp! - now < (decodedAccessToken.exp! - decodedAccessToken.iat!) / 3) {
    try {
      const res = await authApiRequest.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      if (params?.onSuccess) params.onSuccess()
    } catch (error) {
      if (params?.onError) params.onError()
    }
  }
}
