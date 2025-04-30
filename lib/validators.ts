import { z } from 'zod';
import { formatNumberWithDecimal } from './utils';
import { PAYMENT_METHODS } from './constants';

const currency = z
  .string()
  .refine(
    (value) => /^\d+(\.\d{2})?$/.test(formatNumberWithDecimal(Number(value))),
    'Price must be a valid number with 2 decimal places'
  );
// Schema for inserting products

export const insertProductSchema = z.object({
  name: z
    .string()
    .min(3, 'Name must be at least 3 characters')
    .max(255, 'Name must be at most 255 characters'),
  slug: z
    .string()
    .min(3, 'Slug must be at least 3 characters')
    .max(255, 'Slug must be at most 255 characters'),
  category: z
    .string()
    .min(3, 'Category must be at least 3 characters')
    .max(255, 'Category must be at most 255 characters'),
  brand: z
    .string()
    .min(3, 'Brand must be at least 3 characters')
    .max(255, 'Brand must be at most 255 characters'),
  description: z
    .string()
    .min(3, 'Description must be at least 3 characters')
    .max(500, 'Description must be at most 255 characters'),
  stock: z.coerce.number(),
  images: z.array(z.string()).min(1, 'Product must have at least 1 image'),
  isFeatured: z.boolean(),
  banner: z.string().nullable(),
  price: currency,
  size: z.string().optional().nullable(),
});

// schema for updating product
export const updateProductSchema = insertProductSchema.extend({
  id: z.string().min(1, 'id is required'),
});

// schema for signing user in

export const signInFormSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// schema for sign out a user

export const signUpFormSchema = z
  .object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string()
      .min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password don't match",
    path: ['confirmPassword'],
  });

// schema for resetting password
export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

// cart schemas

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  name: z.string().min(1, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  qty: z.number().int().nonnegative('Quantity must be a positive number'),
  image: z.string().min(1, 'Image is required'),
  price: currency,
  size: z.string().optional().nullable(),
});

export const insertCartSchema = z.object({
  items: z.array(cartItemSchema),
  itemsPrice: currency,
  totalPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  sessionCartId: z.string().min(1, 'Session cart id is required'),
  userId: z.string().optional().nullable(),
});

// schema for shipping address

export const shippingAddressSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters'),
  streetAddress: z.string().min(3, 'Address must be at least 3 characters'),
  city: z.string().min(3, 'City must be at least 3 characters'),
  postalCode: z.string().min(3, 'Postal code must be at least 3 characters'),
  country: z.string().min(3, 'Country must be at least 3 characters'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

// schema for payment method

export const paymentMethodSchema = z
  .object({
    type: z.string().min(1, 'Payment method must be at least 1 characters'),
  })
  .refine((data) => PAYMENT_METHODS.includes(data.type), {
    path: ['type'],
    message: 'Invalid payment method',
  });

// schema for insert order

export const insertOrderSchema = z.object({
  userId: z.string().min(1, 'User id is required'),
  itemsPrice: currency,
  shippingPrice: currency,
  taxPrice: currency,
  totalPrice: currency,
  paymentMethod: z.string().refine((data) => PAYMENT_METHODS.includes(data), {
    message: 'Invalid payment method',
  }),
  shippingAddress: shippingAddressSchema,
});

// schema for inserting an order item

export const insertOrderItemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  image: z.string(),
  name: z.string(),
  price: currency,
  qty: z.number().int().nonnegative(),
  size: z.string().optional().nullable(),
});

export const paymentResultSchema = z.object({
  id: z.string(),
  status: z.string(),
  email_address: z.string(),
  pricePaid: z.string(),
});

// schema for updating user profile

export const updateUserProfileSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
});

// schema to update user
export const editUserSchema = updateUserProfileSchema.extend({
  id: z.string().min(1, 'Id is required'),
  role: z.string().min(1, 'Role is required'),
});

// schema to insert review
export const insertReviewSchema = z.object({
  title: z.string().min(3, 'Title most be at least 3 characters'),
  description: z.string().min(3, 'Description most be at least 3 characters'),
  productId: z.string().min(1, 'Product id is required'),
  userId: z.string().min(1, 'Product id is required'),
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be at least 1')
    .max(5, 'Rating must be at most 5'),
});

// schema to insert tracking number
export const insertTrackingNumberSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  id: z.string().min(1, 'Order id is required'),
});
