'use client';

import React, { useState } from "react";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAppContext } from "@/context/AppContext";

const categories = [
  "All",
  "Earphone",
  "Headphone",
  "Watch",
  "Smartphone",
  "Laptop",
  "Camera",
  "Accessories",
];

const AllProducts = () => {
  const { products, loadingProducts, productsError, fetchProductData } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-start px-6 md:px-16 lg:px-32 min-h-screen">
        <div className="flex flex-col items-start pt-12 w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between w-full gap-4">
            <div>
              <p className="text-2xl md:text-3xl font-medium">All products</p>
              <div className="w-16 h-0.5 bg-orange-600 rounded-full mt-1"></div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="px-3 py-1.5 text-sm border rounded-md outline-none focus:border-orange-500 w-full sm:w-64"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full py-4 mt-4 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-orange-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {loadingProducts ? (
          <div className="flex flex-col items-center justify-center py-24 w-full text-gray-500">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-600 mb-3"></div>
            <p className="text-sm font-medium">Loading products...</p>
          </div>
        ) : productsError ? (
          <div className="flex flex-col items-center justify-center py-24 w-full text-center">
            <p className="text-red-500 text-sm mb-3">Unable to load products. Please try again.</p>
            <button
              onClick={fetchProductData}
              className="px-4 py-2 text-xs bg-orange-600 text-white rounded hover:bg-orange-700 transition"
            >
              Retry
            </button>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 w-full text-center text-gray-500">
            <p className="text-lg font-medium">No products available yet.</p>
            <p className="text-xs text-gray-400 mt-1">
              {selectedCategory !== "All"
                ? `No products found in category "${selectedCategory}".`
                : "No products matched your criteria."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 items-center gap-6 mt-6 pb-20 w-full">
            {filteredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AllProducts;
