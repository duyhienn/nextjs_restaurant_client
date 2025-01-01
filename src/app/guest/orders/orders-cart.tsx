'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, getVietnameseOrderStatus } from '@/lib/utils'
import { useGuestOrderListQuery } from '@/queries/useGuest'
import Image from 'next/image'
import { useMemo } from 'react'

export default function OrdersCart() {
  const { data } = useGuestOrderListQuery()
  const orders = useMemo(() => data?.payload.data ?? [], [data])

  const totalPrice = useMemo(() => {
    return orders.reduce((accumulator, order) => {
      return accumulator + order.quantity * order.dishSnapshot.price
    }, 0)
  }, [orders])
  return (
    <>
      {orders.map((order) => (
        <div key={order.id} className='flex gap-4'>
          <div className='relative flex-shrink-0'>
            <Image
              src={order.dishSnapshot.image}
              alt={order.dishSnapshot.name}
              height={100}
              width={100}
              quality={100}
              className='object-cover w-[80px] h-[80px] rounded-md'
            />
          </div>
          <div className='space-y-1'>
            <h3 className='text-sm'>{order.dishSnapshot.name}</h3>
            <p className='text-xs'>{order.dishSnapshot.description}</p>
            <div className='text-xs font-semibold'>
              <Badge>{formatCurrency(order.dishSnapshot.price)}</Badge> x {order.quantity}
            </div>
          </div>
          <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
            <Badge variant='outline'>{getVietnameseOrderStatus(order.status)}</Badge>
          </div>
        </div>
      ))}
      <div className='sticky bottom-0'>
        <Button disabled={orders.length === 0} className='w-full justify-between'>
          <span>Tổng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  )
}
