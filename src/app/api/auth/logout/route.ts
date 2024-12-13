import authApiRequest from '@/apiRequests/auth'
import { LoginBodyType } from '@/schemaValidations/auth.schema'
import { cookies } from 'next/headers'
import jwt, { JwtPayload } from 'jsonwebtoken'
import { HttpError } from '@/lib/http'
export async function POST(request: Request) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('accessToken')?.value
  const refreshToken = cookieStore.get('refreshToken')?.value

  cookieStore.delete('accessToken')
  cookieStore.delete('refreshToken')

  if (!accessToken || !refreshToken) {
    return Response.json({ message: 'The token is either invalid or does not exist.' }, { status: 200 })
  }
  try {
    const { payload } = await authApiRequest.sLogout({ accessToken, refreshToken })
    return Response.json(payload)
  } catch (error) {
    return Response.json({ message: 'Server error and logout failed.' }, { status: 200 })
  }
}
