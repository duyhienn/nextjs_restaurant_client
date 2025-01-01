/* eslint-disable react-hooks/exhaustive-deps */
'use client'
import Image from 'next/image'

import { useDishListQuery } from '@/queries/useDish'
import { cn, formatCurrency, handleErrorApi } from '@/lib/utils'
import QuantityController from '@/app/guest/menu/quantity-controller'
import { Button } from '@/components/ui/button'
import { GuestCreateOrdersBodyType } from '@/schemaValidations/guest.schema'
import { useMemo, useState } from 'react'
import { useGuestOrderMutation } from '@/queries/useGuest'
import { useRouter } from 'next/navigation'
import { DishStatus } from '@/constants/type'

export default function MenuOrder() {
  const router = useRouter()
  const [orders, setOrders] = useState<GuestCreateOrdersBodyType>([])
  const { mutateAsync } = useGuestOrderMutation()
  const { data } = useDishListQuery()
  const dishes = data?.payload.data ?? []

  const totalPrice = useMemo(() => {
    return orders.reduce((accumulator, order) => {
      const price = dishes.find((dish) => dish.id === order.dishId)?.price
      if (!price) return 0
      return accumulator + order.quantity * price
    }, 0)
  }, [orders])

  const handleChangeQuantity = (dishId: number, quantity: number) => {
    setOrders((prev) => {
      const index = prev.findIndex((order) => order.dishId === dishId)
      if (quantity === 0) {
        return prev.filter((order) => order.dishId !== dishId)
      }

      if (index === -1) {
        return [...prev, { dishId, quantity }]
      }

      const newOrders = [...prev]
      newOrders[index] = { ...newOrders[index], quantity }
      return newOrders
    })
  }

  const handleOrder = async () => {
    try {
      const result = await mutateAsync(orders)
      if (result.status === 200) {
        router.push('/guest/orders')
      }
    } catch (error) {
      handleErrorApi({
        error
      })
    }
  }

  console.log(orders)

  return (
    <>
      {dishes
        .filter((dish) => dish.status !== DishStatus.Hidden)
        .map((dish) => (
          <div
            key={dish.id}
            className={cn('flex gap-4', {
              'pointer-events-none': dish.status === DishStatus.Unavailable
            })}>
            <div className='relative flex-shrink-0'>
              {dish.status === DishStatus.Unavailable && (
                <span className='absolute inset-0 flex items-center justify-center text-xs'>Hết hàng</span>
              )}
              <Image
                src={dish.image}
                alt={dish.name}
                height={100}
                width={100}
                quality={100}
                className='object-cover w-[80px] h-[80px] rounded-md'
              />
            </div>
            <div className='space-y-1'>
              <h3 className='text-sm'>{dish.name}</h3>
              <p className='text-xs'>{dish.description}</p>
              <p className='text-xs font-semibold'>{formatCurrency(dish.price)}</p>
            </div>
            <div className='flex-shrink-0 ml-auto flex justify-center items-center'>
              <QuantityController
                isDisabled={dish.status === DishStatus.Unavailable}
                onChange={(quantity) => handleChangeQuantity(dish.id, quantity)}
                value={orders.find((order) => order.dishId === dish.id)?.quantity ?? 0}
              />
            </div>
          </div>
        ))}
      <div className='sticky bottom-0'>
        <Button onClick={handleOrder} disabled={orders.length === 0} className='w-full justify-between'>
          <span>Đặt hàng · {orders.length} món</span>
          <span>{formatCurrency(totalPrice)}</span>
        </Button>
      </div>
    </>
  )
}
