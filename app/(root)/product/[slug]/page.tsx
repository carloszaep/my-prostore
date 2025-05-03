import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  checkIfUserBoughtProduct,
  getAllProductsSizesByName,
  getProductBySlug,
} from '@/lib/actions/products.actions';
import { notFound } from 'next/navigation';
import ProductPrice from '@/components/shared/product/product-price';
import ProductImages from '@/components/shared/product/product-images';
import AddToCart from '@/components/shared/product/add-to-cart';
import { getMyCart } from '@/lib/actions/cart.actions';
import { auth } from '@/auth';
import ReviewList from './review-list';
import Link from 'next/link';
import Rating from '@/components/shared/product/rating';

const ProductDetailsPage = async (props: {
  params: Promise<{ slug: string }>;
}) => {
  const { slug } = await props.params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await auth();

  const userId = session?.user?.id;

  const cart = await getMyCart();

  const isVerifiedPurchase = await checkIfUserBoughtProduct(product.id);

  const productSizes = await getAllProductsSizesByName({
    productName: product.name,
  });

  return (
    <>
      <section>
        <div className='grid grid-cols-1 lg:grid-cols-5'>
          {/* Product Image */}
          <div className='col-span-2'>
            <ProductImages images={product.images} />

            {/* product sizes */}
            {product.size && productSizes.length > 0 && (
              <div className='py-2'>
                <p className='font-bold py-2'>Sizes</p>
                <div className='flex flex-wrap gap-2'>
                  {productSizes.map(({ size, slug }) => (
                    <Link href={`/product/${slug}`} key={slug}>
                      {size === product.size ? (
                        <Badge variant={'secondary'} className='rounded-full'>
                          <h2 className='md:text-lg font-medium rounded-full'>
                            {size}
                          </h2>
                        </Badge>
                      ) : (
                        <Badge variant={'outline'} className='rounded-full'>
                          <h2 className='md:text-lg font-medium rounded-full'>
                            {size}
                          </h2>
                        </Badge>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className='col-span-2 p-5'>
            <div className='flex flex-col gap-6'>
              <p>
                {product.brand} {product.category}
              </p>
              <h1 className='h3-bold'>{product.name}</h1>
              <Rating value={Number(product.rating)} />
              <p>{product.numReviews} reviews</p>
              <div className='flex flex-col sm:flex-row sm:items-center gap-3'>
                <ProductPrice
                  value={Number(product.price)}
                  className='w-24 rounded-full bg-green-100 text-green-700 px-5 py-2'
                />
              </div>
            </div>
            <div className='mt-10'>
              <p className='font-semibold'>Description</p>
              <p>{product.description}</p>
            </div>
          </div>
          {/* Product Actions*/}
          <div>
            <Card>
              <CardContent className='p-4'>
                <div className='mb-2 flex justify-between'>
                  <div>Price</div>
                  <div>
                    <ProductPrice value={Number(product.price)} />
                  </div>
                </div>
                <div className='mb-2 flex justify-between'>
                  <div>Status</div>
                  {product.stock > 0 ? (
                    <Badge variant={'outline'}>In Stock</Badge>
                  ) : (
                    <Badge variant={'destructive'}>Out of Stock</Badge>
                  )}
                </div>
                {product.stock > 0 && (
                  <div className='flex-center'>
                    <AddToCart
                      cart={cart}
                      item={{
                        productId: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        qty: 1,
                        image: product.images![0],
                        size: product?.size,
                      }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      <section className='mt-10'>
        <h2 className='h2-bold'>Costumer Reviews</h2>
        {/* a small text to let user know review are different by products size */}
        {product.size && (
          <p className='text-xs text-muted-foreground'>
            Reviews are different by product size. Please check the size.
          </p>
        )}

        <ReviewList
          userId={userId || ''}
          productId={product.id}
          productSlug={product.slug}
          isVerifiedPurchase={
            isVerifiedPurchase || session?.user?.role === 'admin' || false
          }
        />
      </section>
    </>
  );
};

export default ProductDetailsPage;
