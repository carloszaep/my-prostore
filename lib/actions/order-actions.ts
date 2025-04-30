'use server';

import { isRedirectError } from 'next/dist/client/components/redirect-error';
import { convertToPlainObject, formatError } from '../utils';
import { auth } from '@/auth';
import { getMyCart } from './cart.actions';
import { getUserById } from './user.actions';
import { insertOrderSchema } from '../validators';
import { prisma } from '@/db/prisma';
import { CartItem, PaymentResult, ShippingAddress } from '@/types';
import { paypal } from '../paypal';
import { revalidatePath } from 'next/cache';
import { PAGE_SIZE, PAYMENT_METHODS } from '../constants';
import { Prisma } from '@prisma/client';
import { sendOrderUpdatedEmail, sendPurchaseReceiptEmail } from '@/email';

// create order and create order items

export async function createOrder() {
  try {
    const session = await auth();
    if (!session) throw new Error('User not found');

    const cart = await getMyCart();

    const userId = session?.user?.id;
    if (!userId) throw new Error('User not found');

    const user = await getUserById(userId);

    if (!cart || cart.items.length === 0)
      return { success: false, message: 'Cart is empty', redirectTo: '/cart' };
    if (!user.address)
      return {
        success: false,
        message: 'No shipping address',
        redirectTo: '/shipping-address',
      };

    if (!user.paymentMethod && PAYMENT_METHODS.length > 1)
      return {
        success: false,
        message: 'No payment method',
        redirectTo: '/payment-method',
      };

    // create order object
    const order = insertOrderSchema.parse({
      userId: userId,
      shippingAddress: user.address,
      paymentMethod: user.paymentMethod || PAYMENT_METHODS[0],
      itemsPrice: cart.itemsPrice,
      shippingPrice: cart.shippingPrice,
      taxPrice: cart.taxPrice,
      totalPrice: cart.totalPrice,
    });

    // create a transaction to create order and order items
    const insertedOrderId = await prisma.$transaction(async (tx) => {
      // create order
      const insertedOrder = await tx.order.create({ data: order });
      // create order items form the cart items

      for (const item of cart.items as CartItem[]) {
        await tx.orderItem.create({
          data: {
            ...item,
            price: item.price,
            orderId: insertedOrder.id,
          },
        });
      }
      //clear cart
      await tx.cart.update({
        where: { id: cart.id },
        data: {
          items: [],
          totalPrice: 0,
          shippingPrice: 0,
          taxPrice: 0,
          itemsPrice: 0,
        },
      });

      return insertedOrder.id;
    });

    if (!insertedOrderId) throw new Error('Failed to create order');

    return {
      success: true,
      message: 'Order created',
      redirectTo: `/order/${insertedOrderId}`,
    };
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { success: false, message: formatError(error) };
  }
}

// get order by id
export async function getOrderById(orderId: string) {
  const data = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  return convertToPlainObject(data);
}

// create new paypal order
export async function createPayPalOrder(orderId: string) {
  try {
    // get order from db
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (order) {
      // create paypal order
      const paypalOrder = await paypal.createOrder(Number(order.totalPrice));

      // update order with paypal order id
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentResult: {
            id: paypalOrder.id,
            email_address: '',
            status: '',
            pricePaid: 0,
          },
        },
      });

      return {
        success: true,
        message: 'Item order created successfully',
        data: paypalOrder.id,
      };
    } else {
      throw new Error('Order not found');
    }
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// approve paypal order and update order to paid
export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  try {
    // get order from db
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
      },
    });
    if (!order) throw new Error('Order not found');

    const captureData = await paypal.capturePayment(data.orderID);

    if (
      !captureData ||
      captureData.id !== (order.paymentResult as PaymentResult)?.id ||
      captureData.status !== 'COMPLETED'
    ) {
      throw new Error('Error in paypal payment');
    }

    // update order to paid
    await updateOrderToPaid({
      orderId,
      paymentResult: {
        id: captureData.id,
        status: captureData.status,
        email_address: captureData.payer.email_address,
        pricePaid:
          captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
      },
    });

    revalidatePath(`/order${orderId}`);

    return {
      success: true,
      message: 'Order has been paid',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update order to paid
export async function updateOrderToPaid({
  orderId,
  paymentResult,
}: {
  orderId: string;
  paymentResult?: PaymentResult;
}) {
  // get order from db
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
    },
    include: {
      orderitems: true,
    },
  });
  if (!order) throw new Error('Order not found');

  if (order.isPaid) throw new Error('Order is already paid');

  // transaction to update order and account for product stock

  await prisma.$transaction(async (tx) => {
    // iterate over products and update stock
    for (const item of order.orderitems) {
      await tx.product.update({
        where: { id: item.productId },
        data: { stock: { increment: -item.qty } },
      });
    }

    // set the order to paid

    await tx.order.update({
      where: { id: orderId },
      data: {
        isPaid: true,
        paidAt: new Date(),
        paymentResult,
      },
    });
  });

  // get update order after trans

  const updateOrder = await prisma.order.findFirst({
    where: { id: orderId },
    include: {
      orderitems: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!updateOrder) throw new Error('Order nor found');

  sendPurchaseReceiptEmail({
    order: {
      ...updateOrder,
      shippingAddress: updateOrder.shippingAddress as ShippingAddress,
      paymentResult: updateOrder.shippingAddress as PaymentResult,
    },
  });
}

//get user's orders

export async function getMyOrders({
  limit = PAGE_SIZE,
  page,
}: {
  limit?: number;
  page: number;
}) {
  const session = await auth();

  if (!session) throw new Error('User is not authorized');

  const data = await prisma.order.findMany({
    where: { userId: session?.user?.id, isPaid: true },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
  });

  const dataCount = await prisma.order.count({
    where: { userId: session?.user?.id },
  });

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

type SalesDataType = {
  month: string;
  totalSales: number;
}[];

// get sales data and order summary
export async function getOrderSummary() {
  // get count for each resource
  const ordersCount = await prisma.order.count();
  const productsCount = await prisma.product.count();
  const usersCount = await prisma.user.count();

  // calculate the total sales
  const totalSales = await prisma.order.aggregate({
    _sum: {
      totalPrice: true,
    },
  });

  // get monthly sales data
  const salesDataRaw = await prisma.$queryRaw<
    Array<{ month: string; totalSales: Prisma.Decimal }>
  >`SELECT to_char("createdAt", 'MM/YY') as "month", sum("totalPrice") as "totalSales" FROM "Order" GROUP BY to_char("createdAt", 'MM/YY')`;

  const salesData: SalesDataType = salesDataRaw.map((entry) => ({
    month: entry.month,
    totalSales: Number(entry.totalSales),
  }));

  // get latest sales
  const latestSales = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
    take: 6,
  });

  return {
    ordersCount,
    productsCount,
    usersCount,
    totalSales,
    salesData,
    latestSales,
  };
}

// get all orders
export async function getAllOrders({
  limit = PAGE_SIZE,
  page,
  query,
}: {
  limit?: number;
  page: number;
  query?: string;
}) {
  // Query filter
  const queryFilter: Prisma.OrderWhereInput =
    query && query !== 'all'
      ? {
          user: {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          },
        }
      : {};

  const data = await prisma.order.findMany({
    where: { ...queryFilter },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: (page - 1) * limit,
    include: { user: { select: { name: true } } },
  });

  const dataCount = await prisma.order.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}

// delete order

export async function deleteOrder(id: string) {
  try {
    await prisma.order.delete({
      where: { id },
    });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Order deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// delete all order that have not been paid
export async function deleteUnpaidOrders() {
  try {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const orders = await prisma.order.findMany({
      where: { isPaid: false, createdAt: { lt: oneDayAgo } },
    });

    if (orders.length === 0)
      throw new Error('No unpaid orders found withing 24h');

    await prisma.order.deleteMany({
      where: { isPaid: false },
    });

    revalidatePath('/admin/orders');

    return {
      success: true,
      message: 'Unpaid orders deleted successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update COD order to paid

export async function updateOrderToPaidCOD(orderId: string) {
  try {
    await updateOrderToPaid({ orderId });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order marked as paid',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update COD order to delivered

export async function deliverOrder(orderId: string) {
  try {
    const order = await prisma.order.findFirst({
      where: { id: orderId },
    });

    if (!order) throw new Error('Order not found');
    if (!order.isPaid) throw new Error('Order is not paid');

    await prisma.order.update({
      where: { id: orderId },
      data: {
        isDelivered: true,
        deliveredAt: new Date(),
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Order marked as delivered',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// insert tracking number
export async function insertTrackingNumber({
  orderId,
  trackingNumber,
}: {
  orderId: string;
  trackingNumber: string;
}) {
  try {
    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber },
      include: {
        orderitems: true,
        user: { select: { name: true, email: true } },
      },
    });

    sendOrderUpdatedEmail({
      order: {
        ...updatedOrder,
        shippingAddress: updatedOrder.shippingAddress as ShippingAddress,
        paymentResult: updatedOrder.paymentResult as PaymentResult,
        orderitems: updatedOrder.orderitems,
        user: updatedOrder.user as { name: string; email: string },
      },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Tracking number added successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// remove tracking number
export async function removeTrackingNumber(orderId: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { trackingNumber: null, isDelivered: false },
    });

    revalidatePath(`/order/${orderId}`);

    return {
      success: true,
      message: 'Tracking number removed successfully',
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}
