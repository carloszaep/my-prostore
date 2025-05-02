import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

import { formatCurrency } from '@/lib/utils';
import { Order } from '@/types';
import { SERVER_URL } from '@/lib/constants';

// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

const dateFormatter = new Intl.DateTimeFormat('en', { dateStyle: 'medium' });

export default function PurchaseReceiptEmail({ order }: { order: Order }) {
  return (
    <Html>
      <Preview>Order was shipped</Preview>
      <Tailwind>
        <Head />
        <Body className='font-sans bg-white'>
          <Container className='max-w-xl'>
            <Heading>Order was shipped</Heading>
            <Section>
              <Row>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                    Order ID
                  </Text>
                  <Text className='mt-0 mr-4'>{order.id.toString()}</Text>
                </Column>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                    Purchase Date
                  </Text>
                  <Text className='mt-0 mr-4'>
                    {dateFormatter.format(order.createdAt)}
                  </Text>
                </Column>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                    Price Paid
                  </Text>
                  <Text className='mt-0 mr-4'>
                    {formatCurrency(order.totalPrice)}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section>
              <Row>
                <Column>
                  <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                    Order Tracking Number
                  </Text>
                  <Text className='mt-0 mr-4'>
                    {order.trackingNumber?.toString()}
                  </Text>
                </Column>
              </Row>
            </Section>
            <Section className='border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4'>
              {order.orderitems.map((item) => (
                <Row key={item.productId} className='mt-8'>
                  <Column className='w-20'>
                    <Img
                      width='80'
                      alt={item.name}
                      className='rounded'
                      src={
                        item.image.startsWith('/')
                          ? `${process.env.NEXT_PUBLIC_SERVER_URL}${item.image}`
                          : item.image
                      }
                    />
                  </Column>
                  <Column className='align-top'>
                    {item.name} x {item.qty}
                  </Column>
                  <Column align='right' className='align-top'>
                    {formatCurrency(item.price)}
                  </Column>
                </Row>
              ))}
              {[
                { name: 'Items', price: order.itemsPrice },
                { name: 'Tax', price: order.taxPrice },
                { name: 'Shipping', price: order.shippingPrice },
                { name: 'Total', price: order.totalPrice },
              ].map(({ name, price }) => (
                <Row key={name} className='py-1'>
                  <Column align='right'>{name}: </Column>
                  <Column align='right' width={70} className='align-top'>
                    <Text className='m-0'>{formatCurrency(price)}</Text>
                  </Column>
                </Row>
              ))}
            </Section>
            <Section className='border border-solid border-gray-500 rounded-lg p-6 my-4'>
              <Text className='mb-0 mr-4 text-gray-500 whitespace-nowrap text-nowrap'>
                Shipping Address
              </Text>
              <Text className='mt-0 mr-4'>
                {order.shippingAddress.fullName}
                <br />
                {order.shippingAddress.streetAddress}
                <br />
                {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                <br />
                {order.shippingAddress.country}
              </Text>
            </Section>
            {/* link to check order in web app */}
            <Section className='border border-solid border-gray-500 rounded-lg  p-6 my-4'>
              <Link
                className='inline-block bg-blue-600 text-white rounded px-5 py-2 no-underline text-center'
                href={`${SERVER_URL}/order/${order.id}`}
              >
                View Order
              </Link>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
