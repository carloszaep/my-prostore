"use server";
import { prisma } from "@/db/prisma";
import { convertToPlainObject, formatError } from "../utils";
import {
  FEATURED_PRODUCTS_LIMIT,
  LATEST_PRODUCTS_LIMIT,
  PAGE_SIZE,
} from "../constants";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { insertProductSchema, updateProductSchema } from "../validators";
import { Prisma } from "@prisma/client";
import { auth } from "@/auth";
import { utapi } from "@/server/uploadthing";

// get latest products
export const getLatestProducts = async () => {
  const data = await prisma.product.findMany({
    distinct: ["name"],
    take: LATEST_PRODUCTS_LIMIT,
    orderBy: { createdAt: "desc" },
  });

  return convertToPlainObject(data);
};

// get single product by slug
export const getProductBySlug = async (slug: string) => {
  const data = await prisma.product.findFirst({
    where: { slug },
  });

  return convertToPlainObject(data);
};
// get single product by id
export const getProductById = async (productId: string) => {
  const data = await prisma.product.findFirst({
    where: { id: productId },
  });

  return convertToPlainObject(data);
};

// get all products sizes
export async function getAllProductsSizesByName({
  productName,
}: {
  productName: string;
}) {
  const data = await prisma.product.findMany({
    where: {
      name: {
        contains: productName,
        mode: "insensitive",
      } as Prisma.StringFilter,
    },
    // only get size and slug
    select: { size: true, slug: true },
  });

  return data;
}

// Get all products
export async function getAllProducts({
  query,
  limit = PAGE_SIZE,
  page,
  category,
  price,
  rating,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  category?: string;
  price?: string;
  rating?: string;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  // Category filter
  const categoryFilter = category && category !== "all" ? { category } : {};

  // Price filter
  const priceFilter: Prisma.ProductWhereInput =
    price && price !== "all"
      ? {
          price: {
            gte: Number(price.split("-")[0]),
            lte: Number(price.split("-")[1]),
          },
        }
      : {};

  // Rating filter
  const ratingFilter =
    rating && rating !== "all"
      ? {
          rating: {
            gte: Number(rating),
          },
        }
      : {};

  const data = await prisma.product.findMany({
    distinct: ["name"],
    where: {
      ...queryFilter,
      ...categoryFilter,
      ...priceFilter,
      ...ratingFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}
// Get all products admin
export async function getAllProductsAdmin({
  query,
  limit = PAGE_SIZE,
  page,
  sort,
}: {
  query: string;
  limit?: number;
  page: number;
  sort?: string;
}) {
  // Query filter
  const queryFilter: Prisma.ProductWhereInput =
    query && query !== "all"
      ? {
          name: {
            contains: query,
            mode: "insensitive",
          } as Prisma.StringFilter,
        }
      : {};

  const data = await prisma.product.findMany({
    where: {
      ...queryFilter,
    },
    orderBy:
      sort === "lowest"
        ? { price: "asc" }
        : sort === "highest"
          ? { price: "desc" }
          : sort === "rating"
            ? { rating: "desc" }
            : { createdAt: "desc" },
    skip: (page - 1) * limit,
    take: limit,
  });

  const dataCount = await prisma.product.count();

  return {
    data,
    totalPages: Math.ceil(dataCount / limit),
  };
}
// delete product
export async function deleteProduct(id: string) {
  try {
    const productExists = await prisma.product.findFirst({
      where: { id },
    });

    if (!productExists) throw new Error("Product not found");

    // remove the url from the image to get the file key
    const productImages = productExists.images.map((image) =>
      image.replace("https://utfs.io/f/", "")
    );

    await utapi.deleteFiles(productImages);

    await prisma.product.delete({
      where: { id },
    });

    revalidatePath("/admin/product");

    return {
      success: true,
      message: "Product was deleted",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// create product

export async function createProduct(data: z.infer<typeof insertProductSchema>) {
  try {
    const product = insertProductSchema.parse(data);

    await prisma.product.create({
      data: product,
    });

    revalidatePath("/admin/product");

    return {
      success: true,
      message: "Product was created",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// update product

export async function updateProduct(data: z.infer<typeof updateProductSchema>) {
  try {
    const product = updateProductSchema.parse(data);

    const productExists = await prisma.product.findFirst({
      where: { id: product.id },
    });

    if (!productExists) throw new Error("Product not found");

    await prisma.product.update({ where: { id: product.id }, data: product });

    revalidatePath("/admin/product");

    return {
      success: true,
      message: "Product was update",
    };
  } catch (error) {
    return { success: false, message: formatError(error) };
  }
}

// get all categories

export async function getAllCategories() {
  const data = await prisma.product.groupBy({
    by: ["category"],
    _count: true,
  });

  return data;
}

// get featured products
export async function getFeaturedProducts() {
  const data = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: "desc" },
    take: FEATURED_PRODUCTS_LIMIT,
  });

  return convertToPlainObject(data);
}

// check if user had bought the product
export async function checkIfUserBoughtProduct(productId: string) {
  const session = await auth();

  if (!session) return false;

  const data = await prisma.order.findFirst({
    where: {
      userId: session?.user?.id,
      isDelivered: true, // optional: only count completed orders
      orderitems: {
        some: { productId },
      },
    },
  });

  return !!data;
}
