'use client'

import { useAppContext } from '@/components/app-provider'
import { Role } from '@/constants/type'
import { cn, handleErrorApi } from '@/lib/utils'
import { RoleType } from '@/types/jwt.types'
import Link from 'next/link'
import { useLogoutMutation } from '@/queries/useAuth'
import { useRouter } from 'next/navigation'
const menuItems: {
  title: string
  href: string
  roles?: RoleType[]
  hideWhenLogin?: boolean
}[] = [
  {
    title: 'Trang chủ',
    href: '/'
  },
  {
    title: 'Menu',
    href: '/guest/menu',
    roles: [Role.Guest]
  },
  {
    title: 'Đơn hàng',
    href: '/guest/orders',
    roles: [Role.Guest]
  },
  {
    title: 'Đăng nhập',
    href: '/login',
    hideWhenLogin: true
  },
  {
    title: 'Quản lý',
    href: '/manage/dashboard',
    roles: [Role.Owner, Role.Employee]
  }
]

export default function NavItems({ className }: { className?: string }) {
  const { role, setRole } = useAppContext()
  const logoutMutation = useLogoutMutation()
  const router = useRouter()
  const logout = async () => {
    if (logoutMutation.isPending) return
    try {
      const result = await logoutMutation.mutateAsync()
      setRole(undefined)
      router.push('/')
    } catch (error) {
      handleErrorApi({ error })
    }
  }
  return (
    <>
      {menuItems.map((item) => {
        const isAuth = item.roles && role && item.roles.includes(role)
        const canShow = (item.roles === undefined && !item.hideWhenLogin) || (!role && item.hideWhenLogin)

        if (isAuth || canShow) {
          return (
            <Link href={item.href} key={item.href} className={className}>
              {item.title}
            </Link>
          )
        }

        return null
      })}
      {role && (
        <div className={cn(className, 'cursor-pointer')} onClick={logout}>
          Đăng xuất
        </div>
      )}
    </>
  )
}
