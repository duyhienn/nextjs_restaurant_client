import http from '@/lib/http'
import {
  LoginBodyType,
  LoginResType,
  LogoutBodyType,
  RefreshTokenBodyType,
  RefreshTokenResType,
} from '@/schemaValidations/auth.schema'

const authApiRequest = {
  sLogin: (body: LoginBodyType) => http.post<LoginResType>('/auth/login', body),
  login: (body: LoginBodyType) => http.post<LoginResType>('/api/auth/login', body, { baseUrl: '' }),
  sLogout: (body: LogoutBodyType & { accessToken: string }) =>
    http.post(
      '/auth/logout',
      { refreshToken: body.refreshToken },
      {
        headers: {
          Authorization: `Bearer ${body.accessToken}`,
        },
      }
    ),
  /**
   *
   * @description Call to route handler ,(in client side) cookies will be attached to the request automatically
   */
  logout: () => http.post('/api/auth/logout', null, { baseUrl: '' }),
  sRefreshToken: (body: RefreshTokenBodyType) => http.post<RefreshTokenResType>('/auth/refresh-token', body),
  refreshToken: (body: RefreshTokenBodyType) =>
    http.post<RefreshTokenResType>('/api/auth/refresh-token', null, { baseUrl: '' }),
}

export default authApiRequest
