"use client";

import { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useParams } from "next/navigation";
import Loading from "@/components/Loading";
import { useAppContext } from "@/context/AppContext";
import React from "react";
import axios from "axios";

const Product = () => {
  const { id } = useParams();
  const { products, router, addToCart, currency } = useAppContext();

  const [mainImage, setMainImage] = useState(null);
  const [productData, setProductData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProductData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check in existing products first
      const found = products.find((p) => p._id === id);
      if (found) {
        setProductData(found);
        setMainImage(found.image?.[0] || null);
        setLoading(false);
        return;
      }

      // Fetch directly from API
      const { data } = await axios.get(`/api/products/${id}`);
      if (data.success && data.product) {
        setProductData(data.product);
        setMainImage(data.product.image?.[0] || null);
      } else {
        setError("Product not found");
      }
    } catch (err) {
      console.error("Failed to load product:", err);
      setError("Product not found or unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductData();
    }
  }, [id, products]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32">
          <Loading />
          <p className="text-sm text-gray-500 mt-4">Loading product...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !productData) {
    return (
      <>
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center min-h-[60vh]">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Product Not Found</h2>
          <p className="text-gray-500 text-sm mb-6">
            The product you are looking for does not exist or has been removed.
          </p>
          <button
            onClick={() => router.push("/all-products")}
            className="px-6 py-2.5 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition text-sm font-medium"
          >
            Browse All Products
          </button>
        </div>
        <Footer />
      </>
    );
  }

  const images = Array.isArray(productData.image)
    ? productData.image
    : productData.image
    ? [productData.image]
    : [];

  const displayPrice = productData.offerPrice !== undefined ? productData.offerPrice : productData.price;
  const originalPrice = productData.price;
  const relatedProducts = products.filter((p) => p._id !== productData._id).slice(0, 5);

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 pt-14 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="px-5 lg:px-16 xl:px-20">
            <div className="rounded-lg overflow-hidden bg-gray-500/10 mb-4 h-96 flex items-center justify-center">
              {images.length > 0 ? (
                <Image
                  src={mainImage || images[0]}
                  alt={productData.name}
                  className="w-full h-full object-contain mix-blend-multiply p-4"
                  width={1280}
                  height={720}
                  priority
                />
              ) : (
                <div className="text-gray-400">No Image Available</div>
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setMainImage(img)}
                    className={`cursor-pointer rounded-lg overflow-hidden bg-gray-500/10 p-1 border-2 transition ${
                      mainImage === img ? "border-orange-500" : "border-transparent"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={productData.name}
                      className="w-full h-20 object-contain mix-blend-multiply"
                      width={200}
                      height={200}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <h1 className="text-3xl font-medium text-gray-800 mb-4">{productData.name}</h1>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, index) => (
                  <Image
                    key={index}
                    className="h-4 w-4"
                    src={index < 4 ? assets.star_icon : assets.star_dull_icon}
                    alt="star"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">(4.0)</p>
            </div>

            <p className="text-gray-600 mt-4 leading-relaxed">{productData.description}</p>

            <div className="flex items-baseline gap-3 mt-6">
              <p className="text-3xl font-semibold text-gray-900">
                {currency}
                {displayPrice}
              </p>
              {originalPrice && originalPrice > displayPrice && (
                <span className="text-lg font-normal text-gray-400 line-through">
                  {currency}
                  {originalPrice}
                </span>
              )}
            </div>

            <hr className="border-gray-200 my-6" />

            <div className="overflow-x-auto">
              <table className="table-auto border-collapse w-full max-w-72 text-sm">
                <tbody>
                  <tr>
                    <td className="text-gray-500 font-medium py-1">Category</td>
                    <td className="text-gray-800 py-1 font-semibold">{productData.category}</td>
                  </tr>
                  <tr>
                    <td className="text-gray-500 font-medium py-1">Availability</td>
                    <td className="text-green-600 font-medium py-1">In Stock</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex items-center mt-10 gap-4">
              <button
                onClick={() => addToCart(productData._id)}
                className="w-full py-3.5 bg-gray-100 text-gray-800 font-medium hover:bg-gray-200 transition rounded-md"
              >
                Add to Cart
              </button>
              <button
                onClick={() => {
                  addToCart(productData._id);
                  router.push("/cart");
                }}
                className="w-full py-3.5 bg-orange-600 text-white font-medium hover:bg-orange-700 transition rounded-md shadow"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="flex flex-col items-center pt-16">
            <div className="flex flex-col items-center mb-6">
              <p className="text-2xl font-medium">
                Related <span className="text-orange-600">Products</span>
              </p>
              <div className="w-24 h-0.5 bg-orange-600 mt-2"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mt-6 pb-14 w-full">
              {relatedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default Product;