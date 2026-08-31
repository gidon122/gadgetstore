'use client';

import React from "react";
import ProductCard from "./ProductCard";
import { useAppContext } from "@/context/AppContext";

const HomeProducts = () => {
  const { products, loadingProducts, productsError, fetchProductData, router } = useAppContext();

  return (
    <div className="flex flex-col items-center pt-14">
      <div className="flex items-center justify-between w-full">
        <p className="text-2xl font-medium text-left">Popular products</p>
        {products.length > 0 && (
          <button
            onClick={() => router.push("/all-products")}
            className="text-sm font-medium text-orange-600 hover:text-orange-700 transition"
          >
            View all ({products.length})
          </button>
        )}
      </div>

      {loadingProducts ? (
        <div className="flex flex-col items-center justify-center py-16 w-full text-gray-500">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-3"></div>
          <p className="text-sm font-medium">Loading products...</p>
        </div>
      ) : productsError ? (
        <div className="flex flex-col items-center justify-center py-16 w-full text-center">
          <p className="text-red-500 text-sm mb-3">Unable to load products. Please try again.</p>
          <button
            onClick={fetchProductData}
            className="px-4 py-2 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition"
          >
            Retry
          </button>
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 w-full text-center text-gray-500">
          <p className="text-base font-medium">No products available yet.</p>
          <p className="text-xs text-gray-400 mt-1">Please check back soon for new arrivals.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center gap-6 mt-6 pb-14 w-full">
            {products.slice(0, 10).map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          <button
            onClick={() => router.push("/all-products")}
            className="px-12 py-2.5 border rounded text-gray-600 hover:bg-slate-50 transition font-medium text-sm"
          >
            See more
          </button>
        </>
      )}
    </div>
  );
};

export default HomeProducts;