import authApiRequest from '@/apiRequests/auth'
import { RefreshTokenBodyType } from '@/schemaValidations/auth.schema'
import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { HttpError } from '@/lib/http'
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get('refreshToken')?.value

  if (!refreshToken) {
    return Response.json({ message: 'The refreshToken is either invalid or does not exist.' }, { status: 401 })
  }
  try {
    const { payload } = await authApiRequest.sRefreshToken({ refreshToken })
    const decodedAccessToken = jwt.decode(payload.data.accessToken) as JwtPayload
    const decodedRefreshToken = jwt.decode(payload.data.refreshToken) as JwtPayload
    cookieStore.set('accessToken', payload.data.accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp! * 1000,
    })
    cookieStore.set('refreshToken', payload.data.refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp! * 1000,
    })
    return Response.json(payload)
  } catch (error: any) {
    return Response.json(error.message, { status: 401 })
  }
}
