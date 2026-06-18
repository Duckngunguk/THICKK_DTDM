import prisma from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { productId, orderId, rating, review } = await req.json()

    if (!productId || !orderId || !rating) {
      return Response.json(
        { error: 'Thiếu dữ liệu' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
        status: 'DELIVERED',
        orderItems: {
          some: {
            productId
          }
        }
      }
    })

    if (!order) {
      return Response.json(
        { error: 'Bạn chỉ được đánh giá sản phẩm đã nhận hàng' },
        { status: 403 }
      )
    }

    const existed = await prisma.rating.findFirst({
      where: {
        userId: user.id,
        productId,
        orderId
      }
    })

    if (existed) {
      return Response.json(
        { error: 'Bạn đã đánh giá sản phẩm này' },
        { status: 409 }
      )
    }

    const newRating = await prisma.rating.create({
      data: {
        rating,
        review,
        userId: user.id,
        productId,
        orderId
      }
    })

    return Response.json(newRating)

  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    )
  }
}