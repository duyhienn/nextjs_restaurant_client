import { toast } from '@/hooks/use-toast'
import { EntityError } from '@/lib/http'
import { type ClassValue, clsx } from 'clsx'
import { UseFormSetError } from 'react-hook-form'
import { twMerge } from 'tailwind-merge'
import jwt, { JwtPayload } from 'jsonwebtoken'
import authApiRequest from '@/apiRequests/auth'
import { DishStatus, OrderStatus, Role, TableStatus } from '@/constants/type'
import envConfig from '@/config'
import { TokenPayload } from '@/types/jwt.types'

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
  duration
}: {
  error: any
  setError?: UseFormSetError<any>
  duration?: number
}) => {
  if (error instanceof EntityError && setError) {
    error.payload.errors.forEach((item) => {
      setError(item.field, {
        type: 'server',
        message: item.message
      })
    })
  } else {
    toast({
      title: 'Error',
      description: error?.payload?.message ?? 'Unknown error',
      variant: 'destructive',
      duration: duration ?? 2000
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
  const decodedAccessToken = jwt.decode(accessToken) as JwtPayload & TokenPayload
  const decodedRefreshToken = jwt.decode(refreshToken) as JwtPayload & TokenPayload

  const now = new Date().getTime() / 1000 - 1

  if (decodedRefreshToken.exp! <= now) {
    removeTokensFromLocalStorage()
    return params?.onError && params.onError()
  }

  if (decodedAccessToken.exp! - now < (decodedAccessToken.exp! - decodedAccessToken.iat!) / 3) {
    try {
      const role = decodedRefreshToken.role
      const res = role === Role.Guest ? await authApiRequest.refreshToken() : await authApiRequest.refreshToken()
      setAccessTokenToLocalStorage(res.payload.data.accessToken)
      setRefreshTokenToLocalStorage(res.payload.data.refreshToken)
      if (params?.onSuccess) params.onSuccess()
    } catch (error) {
      if (params?.onError) params.onError()
    }
  }
}

export const formatCurrency = (number: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(number)
}

export const getVietnameseDishStatus = (status: (typeof DishStatus)[keyof typeof DishStatus]) => {
  switch (status) {
    case DishStatus.Available:
      return 'Có sẵn'
    case DishStatus.Unavailable:
      return 'Không có sẵn'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseTableStatus = (status: (typeof TableStatus)[keyof typeof TableStatus]) => {
  switch (status) {
    case TableStatus.Available:
      return 'Có sẵn'
    case TableStatus.Reserved:
      return 'Đã đặt'
    default:
      return 'Ẩn'
  }
}

export const getVietnameseOrderStatus = (status: (typeof OrderStatus)[keyof typeof OrderStatus]) => {
  switch (status) {
    case OrderStatus.Pending:
      return 'Đang chờ'
    case OrderStatus.Processing:
      return 'Đang xử lý món ăn'
    case OrderStatus.Delivered:
      return 'Đã giao'
    case OrderStatus.Paid:
      return 'Đã thanh toán'
    case OrderStatus.Rejected:
      return 'Đã từ chối'
    default:
      return 'Đã hoàn thành'
  }
}

export const getTableLink = ({ token, tableNumber }: { token: string; tableNumber: number }) => {
  return envConfig.NEXT_PUBLIC_URL + '/tables/' + tableNumber + '?token=' + token
}

export const deocodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload
}
