import { Role } from '@/constants/type'
import { deocodeToken } from '@/lib/utils'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const managePaths = ['/manage']
const guestPaths = ['/guest']
const privatePaths = [...managePaths, ...guestPaths]
const unAuthPaths = ['/login']

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  // pathname: /manage/dashboard
  const accessToken = request.cookies.get('accessToken')?.value
  const refreshToken = request.cookies.get('refreshToken')?.value

  // 1.Chưa đăng nhập thì không cho vào private paths
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL('/login', request.url)
    url.searchParams.set('clearTokens', 'true')
    return NextResponse.redirect(url)
  }

  // 2.Đã đăng nhập
  if (refreshToken) {
    //2.1 Đăng nhập rồi thì sẽ không cho vào login nữa
    if (unAuthPaths.some((path) => pathname.startsWith(path))) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    //2.2 Trường hợp đăng nhập rồi, nhưng access token lại hết hạn
    if (privatePaths.some((path) => pathname.startsWith(path)) && !accessToken) {
      const url = new URL('/refresh-token', request.url)
      url.searchParams.set('refreshToken', refreshToken)
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }

    //2.3 Trường hợp vào không đúng Role
    const role = deocodeToken(refreshToken).role
    const isGuestGoToManagePaths = role === Role.Guest && managePaths.some((path) => pathname.startsWith(path))
    const isNotGuestGoToGuestPaths = role !== Role.Guest && guestPaths.some((path) => pathname.startsWith(path))
    if (isGuestGoToManagePaths || isNotGuestGoToGuestPaths) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}
// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/manage/:path*', '/guest/:path*', '/login']
}
