'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';

const ProductImages = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);

  return (
    <div className='space-y-4'>
      <Image
        src={images[current]}
        alt='product image'
        width={1000}
        height={1000}
        className='min-h-[300px] object-cover object-center'
      />
      <div className='flex'>
        {images.map((image, idx) => (
          <div
            key={idx}
            onClick={() => setCurrent(idx)}
            className={cn(
              'border rounded-sm mr-2 cursor-pointer hover:border-gray-800',
              current === idx && 'border-gray-700'
            )}
          >
            <Image
              src={image}
              alt='product image'
              width={100}
              height={100}
              className=' rounded-sm'
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductImages;
