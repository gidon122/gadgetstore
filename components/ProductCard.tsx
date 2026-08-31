'use client';

import React from 'react';
import { assets } from '@/assets/assets';
import Image from 'next/image';
import { useAppContext } from '@/context/AppContext';

const ProductCard = ({ product }: { product: any }) => {
  const { currency, router } = useAppContext();

  if (!product) return null;

  const displayImage = Array.isArray(product.image)
    ? product.image[0]
    : typeof product.image === 'string'
    ? product.image
    : assets.upload_area;

  const price = product.offerPrice !== undefined ? product.offerPrice : product.price;

  return (
    <div
      onClick={() => {
        router.push('/product/' + product._id);
        if (typeof window !== 'undefined') window.scrollTo(0, 0);
      }}
      className="flex flex-col items-start gap-1 max-w-[220px] w-full cursor-pointer group"
    >
      <div className="relative bg-gray-500/10 rounded-lg w-full h-52 flex items-center justify-center overflow-hidden p-2">
        {displayImage ? (
          <Image
            src={displayImage}
            alt={product.name || 'Product'}
            className="group-hover:scale-105 transition object-contain w-full h-full mix-blend-multiply"
            width={400}
            height={400}
          />
        ) : (
          <div className="text-xs text-gray-400">No Image</div>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50 transition"
          aria-label="Save to wishlist"
        >
          <Image className="h-3 w-3" src={assets.heart_icon} alt="heart_icon" />
        </button>
      </div>

      <p className="md:text-base font-medium pt-2 w-full truncate text-gray-800">{product.name}</p>
      <p className="w-full text-xs text-gray-500 max-sm:hidden truncate">{product.description}</p>
      
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="text-xs font-semibold text-gray-700">4.5</span>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }).map((_, index) => (
            <Image
              key={index}
              className="h-3 w-3"
              src={index < 4 ? assets.star_icon : assets.star_dull_icon}
              alt="star"
            />
          ))}
        </div>
      </div>

      <div className="flex items-end justify-between w-full mt-1">
        <p className="text-base font-semibold text-gray-900">
          {currency}
          {price}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            router.push('/product/' + product._id);
          }}
          className="max-sm:hidden px-3.5 py-1 text-gray-600 border border-gray-300 rounded-full text-xs hover:bg-orange-600 hover:text-white hover:border-orange-600 transition"
        >
          Buy now
        </button>
      </div>
    </div>
  );
};

export default ProductCard;