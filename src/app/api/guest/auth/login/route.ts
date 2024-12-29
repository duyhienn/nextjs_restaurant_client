import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { HttpError } from '@/lib/http'
import { GuestLoginBodyType } from '@/schemaValidations/guest.schema'
import guestApiRequest from '@/apiRequests/guest'
export async function POST(request: Request) {
  const body = (await request.json()) as GuestLoginBodyType
  const cookieStore = await cookies()
  try {
    const { payload } = await guestApiRequest.sLogin(body)
    const { accessToken, refreshToken } = payload.data
    const decodedAccessToken = jwt.decode(accessToken) as JwtPayload
    const decodedRefreshToken = jwt.decode(refreshToken) as JwtPayload
    cookieStore.set('accessToken', accessToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedAccessToken.exp! * 1000
    })
    cookieStore.set('refreshToken', refreshToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      expires: decodedRefreshToken.exp! * 1000
    })
    return Response.json(payload)
  } catch (error) {
    if (error instanceof HttpError) {
      return Response.json(error.payload, { status: error.status })
    } else {
      return Response.json(error, { status: 500 })
    }
  }
}
