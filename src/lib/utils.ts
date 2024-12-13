import { toast } from '@/hooks/use-toast'
import { EntityError } from '@/lib/http'
import { type ClassValue, clsx } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'

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
 * Handle error from api (EntityError 422)
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
      title: 'Lỗi',
      description: error?.payload?.message ?? 'Lỗi không xác định',
      variant: 'destructive',
      duration: duration ?? 5000,
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
