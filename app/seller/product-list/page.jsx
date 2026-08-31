'use client';

import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import axios from "axios";
import toast from "react-hot-toast";

const ProductList = () => {
  const { router, getToken, currency } = useAppContext();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchSellerProduct = async () => {
    try {
      const token = await getToken();
      const { data } = await axios.get("/api/product/seller-list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        toast.error(data.message || "Failed to load seller products");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellerProduct();
  }, []);

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between">
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32">
          <Loading />
          <p className="text-sm text-gray-500 mt-4">Loading your products...</p>
        </div>
      ) : (
        <div className="w-full md:p-10 p-4">
          <div className="flex items-center justify-between pb-4 max-w-4xl">
            <h2 className="text-lg font-medium">All Products ({products.length})</h2>
            <button
              onClick={() => router.push("/seller")}
              className="px-4 py-1.5 bg-orange-600 text-white rounded text-xs font-medium hover:bg-orange-700 transition"
            >
              + Add Product
            </button>
          </div>

          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-md max-w-4xl text-center">
              <p className="text-base font-medium text-gray-700">No products added yet.</p>
              <p className="text-xs text-gray-400 mt-1 mb-4">
                Start selling by adding your first product to the catalog.
              </p>
              <button
                onClick={() => router.push("/seller")}
                className="px-5 py-2 bg-orange-600 text-white rounded-md text-xs font-medium hover:bg-orange-700 transition"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center max-w-4xl w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
              <table className="table-fixed w-full overflow-hidden">
                <thead className="text-gray-900 text-sm text-left bg-gray-50">
                  <tr>
                    <th className="w-2/3 md:w-2/5 px-4 py-3 font-medium truncate">Product</th>
                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Category</th>
                    <th className="px-4 py-3 font-medium truncate">Price</th>
                    <th className="px-4 py-3 font-medium truncate max-sm:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm text-gray-500">
                  {products.map((product) => {
                    const displayImage = Array.isArray(product.image)
                      ? product.image[0]
                      : product.image;
                    const price = product.offerPrice !== undefined ? product.offerPrice : product.price;

                    return (
                      <tr key={product._id} className="border-t border-gray-500/20 hover:bg-gray-50/50">
                        <td className="md:px-4 pl-2 md:pl-4 py-3 flex items-center space-x-3 truncate">
                          <div className="bg-gray-500/10 rounded p-2 shrink-0">
                            {displayImage ? (
                              <Image
                                src={displayImage}
                                alt={product.name}
                                className="w-12 h-12 object-contain mix-blend-multiply"
                                width={60}
                                height={60}
                              />
                            ) : (
                              <div className="w-12 h-12 flex items-center justify-center text-xs text-gray-400">
                                N/A
                              </div>
                            )}
                          </div>
                          <span className="truncate font-medium text-gray-800 w-full">{product.name}</span>
                        </td>
                        <td className="px-4 py-3 max-sm:hidden">{product.category}</td>
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {currency}
                          {price}
                        </td>
                        <td className="px-4 py-3 max-sm:hidden">
                          <button
                            onClick={() => router.push(`/product/${product._id}`)}
                            className="flex items-center gap-1 px-3 py-1.5 bg-orange-600 text-white rounded hover:bg-orange-700 transition text-xs"
                          >
                            <span>Visit</span>
                            <Image
                              className="h-3.5 w-3.5"
                              src={assets.redirect_icon}
                              alt="redirect_icon"
                            />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
      <Footer />
    </div>
  );
};

export default ProductList;