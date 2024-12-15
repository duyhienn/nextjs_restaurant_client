import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { HttpError } from '@/lib/http'
import { ChangePasswordV2BodyType } from '@/schemaValidations/account.schema'
import accountApiRequest from '@/apiRequests/account'
export async function PUT(request: Request) {
  const body = (await request.json()) as ChangePasswordV2BodyType
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value

  if (!accessToken) {
    return Response.json({ message: 'Token is either invalid or does not exist' }, { status: 401 })
  }
  try {
    const { payload } = await accountApiRequest.schangePasswordV2(accessToken, body)
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
  } catch (error) {
    console.log(error instanceof HttpError)
    if (error instanceof HttpError) {
      return Response.json({ message: error.payload.message }, { status: error.status })
    } else {
      return Response.json({ message: 'Internal server error' }, { status: 500 })
    }
  }
}
