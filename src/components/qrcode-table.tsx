'use client'
import { getTableLink } from '@/lib/utils'
import QRCode from 'qrcode'
import { useEffect, useRef } from 'react'

export default function QRCodeTable({
  token,
  tableNumber,
  width = 250,
}: {
  token: string
  tableNumber: number
  width?: number
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current!
    canvas.height = width + 70
    canvas.width = width
    const canvasContext = canvas.getContext('2d')!
    canvasContext.fillStyle = '#fff'
    canvasContext.fillRect(0, 0, canvas.width, canvas.height)
    canvasContext.font = '20px Arial'
    canvasContext.textAlign = 'center'
    canvasContext.fillStyle = '#000'
    canvasContext.fillText(`Bàn số ${tableNumber.toString()}`, canvas.width / 2, canvas.width + 20)
    canvasContext.fillText(`Quét mã QR để đặt món`, canvas.width / 2, canvas.width + 50)

    const virtualCanvas = document.createElement('canvas')
    QRCode.toCanvas(
      virtualCanvas,
      getTableLink({ token, tableNumber }),
      {
        width: width,
        margin: 4,
      },
      function (error) {
        if (error) {
          console.error(error)
        }

        canvasContext.drawImage(virtualCanvas, 0, 0, canvas.width, canvas.width)
      }
    )
  }, [tableNumber, token, width])

  return <canvas ref={canvasRef} />
}
