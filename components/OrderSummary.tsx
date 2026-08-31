'use client';

import { useAppContext } from "@/context/AppContext";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";

const OrderSummary = () => {
  const { currency, router, getCartCount, getCartAmount, setCartItems, cartItems } = useAppContext();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [selectedAddress, setSelectedAddress] = useState<any>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAddresses, setUserAddresses] = useState<any[]>([]);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);

  const fetchUserAddresses = async () => {
    try {
      if (isLoaded && user) {
        setIsLoadingAddresses(true);
        const token = await getToken();
        const { data } = await axios.get("/api/address", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (data.success && Array.isArray(data.addresses) && data.addresses.length > 0) {
          setUserAddresses(data.addresses);
          setSelectedAddress(data.addresses[0]);
        } else {
          setUserAddresses([]);
          setSelectedAddress(null);
        }
      }
    } catch (error) {
      console.error("Failed to fetch addresses:", error);
      setUserAddresses([]);
      setSelectedAddress(null);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  const handleAddressSelect = (address: any) => {
    setSelectedAddress(address);
    setIsDropdownOpen(false);
  };

  const createOrder = async () => {
    if (!user) {
      toast.error("Please sign in to place an order");
      return;
    }

    if (getCartCount() === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!selectedAddress) {
      toast.error("Please add or select a delivery address");
      router.push("/add-address");
      return;
    }

    try {
      setIsPlacingOrder(true);
      const token = await getToken();

      const { data } = await axios.post(
        "/api/orders",
        {
          address: selectedAddress,
          items: cartItems,
          paymentMethod: "COD",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (data.success) {
        setCartItems({});
        toast.success("Order placed successfully!");
        router.push("/order-placed");
      } else {
        toast.error(data.message || "Failed to place order");
      }
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to place order"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserAddresses();
    }
  }, [isLoaded, user]);

  return (
    <div className="w-full md:w-96 bg-gray-500/5 p-5 rounded-lg">
      <h2 className="text-xl md:text-2xl font-medium text-gray-700">
        Order Summary
      </h2>
      <hr className="border-gray-500/30 my-5" />
      <div className="space-y-6">
        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Select Address
          </label>
          <div className="relative inline-block w-full text-sm border rounded">
            <button
              className="peer w-full text-left px-4 pr-2 py-2 bg-white text-gray-700 focus:outline-none rounded flex items-center justify-between"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className="truncate">
                {isLoadingAddresses
                  ? "Loading saved addresses..."
                  : selectedAddress
                  ? `${selectedAddress.fullName}, ${selectedAddress.area}, ${selectedAddress.city}`
                  : userAddresses.length === 0
                  ? "No saved address found"
                  : "Select Address"}
              </span>
              <svg
                className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-0" : "-rotate-90"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="#6B7280"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {isDropdownOpen && (
              <ul className="absolute w-full bg-white border shadow-md mt-1 z-10 py-1.5 max-h-48 overflow-y-auto rounded">
                {userAddresses.map((address, index) => (
                  <li
                    key={address._id || index}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-xs border-b last:border-b-0"
                    onClick={() => handleAddressSelect(address)}
                  >
                    <span className="font-semibold">{address.fullName}</span>, {address.area}, {address.city},{" "}
                    {address.state}
                  </li>
                ))}
                <li
                  onClick={() => router.push("/add-address")}
                  className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-center text-orange-600 font-medium text-xs"
                >
                  + Add New Address
                </li>
              </ul>
            )}
          </div>
        </div>

        <div>
          <label className="text-base font-medium uppercase text-gray-600 block mb-2">
            Promo Code
          </label>
          <div className="flex flex-col items-start gap-3">
            <input
              type="text"
              placeholder="Enter promo code"
              className="flex-grow w-full outline-none p-2.5 text-gray-600 border rounded"
            />
            <button className="bg-orange-600 text-white px-9 py-2 hover:bg-orange-700 rounded transition text-sm font-medium">
              Apply
            </button>
          </div>
        </div>

        <hr className="border-gray-500/30 my-5" />

        <div className="space-y-4">
          <div className="flex justify-between text-base font-medium">
            <p className="uppercase text-gray-600">Items ({getCartCount()})</p>
            <p className="text-gray-800">
              {currency}
              {getCartAmount()}
            </p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Shipping Fee</p>
            <p className="font-medium text-green-600">Free</p>
          </div>
          <div className="flex justify-between text-sm">
            <p className="text-gray-600">Tax (2%)</p>
            <p className="font-medium text-gray-800">
              {currency}
              {Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
          <div className="flex justify-between text-lg md:text-xl font-medium border-t pt-3">
            <p>Total</p>
            <p className="text-orange-600 font-semibold">
              {currency}
              {getCartAmount() + Math.floor(getCartAmount() * 0.02)}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={createOrder}
        disabled={isPlacingOrder}
        className="w-full bg-orange-600 text-white py-3 mt-5 hover:bg-orange-700 disabled:opacity-50 transition rounded-md font-medium text-base shadow"
      >
        {isPlacingOrder ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default OrderSummary;