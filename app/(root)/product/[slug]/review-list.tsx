'use client';

import { useEffect } from 'react';
import { Review } from '@/types';
import Link from 'next/link';
import { useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, User } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';
import Rating from '@/components/shared/product/rating';
import ReviewForm from './review-form';
import { getReviews } from '@/lib/actions/review.actions';

const ReviewList = ({
  userId,
  productId,
  productSlug,
  isVerifiedPurchase,
}: {
  userId: string;
  productId: string;
  productSlug: string;
  isVerifiedPurchase: boolean;
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const loadReviews = async () => {
      const res = await getReviews({ productId });
      setReviews(res.data);
    };

    loadReviews();
  }, [productId]);

  // Reload reviews after created or updated
  const reload = async () => {
    const res = await getReviews({ productId });
    setReviews([...res.data]);
  };

  return (
    <div className='space-y-4'>
      {reviews.length === 0 && <div className='mt-3'>No reviews yet</div>}

      <div className='flex flex-col gap-3 mt-3'>
        {reviews.map((review) => (
          <Card key={review.id}>
            <CardHeader>
              <div className='flex-between'>
                <CardTitle>{review.title}</CardTitle>
              </div>
              <CardDescription>{review.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className='flex justify-between md:space-x-4 md:justify-normal text-sm text-muted-foreground'>
                <Rating value={review.rating} />
                <div className='flex items-center'>
                  <User className='mr-1 h-3 w-3' />
                  {review.user ? review.user.name : 'User'}
                </div>
                <div className='flex items-center'>
                  <Calendar className='mr-1 h-3 w-3' />
                  <span className='text-xs'>
                    {formatDateTime(review.createdAt).simpleDate}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {userId ? (
        isVerifiedPurchase ? (
          <ReviewForm
            userId={userId}
            productId={productId}
            onReviewSubmitted={reload}
          />
        ) : (
          <div>You can only review products you have purchased.</div>
        )
      ) : (
        <div>
          Please
          <Link
            className='text-blue-700 px-2'
            href={`/sign-in?callbackUrl=/product/${productSlug}`}
          >
            sign in
          </Link>
          to write a review
        </div>
      )}
    </div>
  );
};

export default ReviewList;
