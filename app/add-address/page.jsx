'use client';

import { assets } from "@/assets/assets";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useAppContext } from "@/context/AppContext";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const AddAddress = () => {
  const { router } = useAppContext();
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
  });

  const fetchExistingAddress = async () => {
    try {
      if (!isLoaded || !user) return;
      const token = await getToken();
      const { data } = await axios.get("/api/address", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success && data.address) {
        setAddress({
          fullName: data.address.fullName || "",
          phoneNumber: data.address.phoneNumber || "",
          pincode: data.address.pincode || "",
          area: data.address.area || "",
          city: data.address.city || "",
          state: data.address.state || "",
        });
      }
    } catch (error) {
      console.error("Failed to load existing address:", error);
    }
  };

  useEffect(() => {
    fetchExistingAddress();
  }, [isLoaded, user]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();

    if (!user) {
      toast.error("Please sign in to save an address");
      return;
    }

    try {
      setLoading(true);
      const token = await getToken();
      const { data } = await axios.post("/api/address", address, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        toast.success(data.message || "Address saved successfully");
        router.push("/cart");
      } else {
        toast.error(data.message || "Failed to save address");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to save address"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="px-6 md:px-16 lg:px-32 py-16 flex flex-col md:flex-row justify-between">
        <form onSubmit={onSubmitHandler} className="w-full">
          <p className="text-2xl md:text-3xl text-gray-500">
            Add Shipping <span className="font-semibold text-orange-600">Address</span>
          </p>
          <div className="space-y-3 max-w-sm mt-10">
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Full name"
              onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
              value={address.fullName}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Phone number"
              onChange={(e) => setAddress({ ...address, phoneNumber: e.target.value })}
              value={address.phoneNumber}
              required
            />
            <input
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
              type="text"
              placeholder="Pin code"
              onChange={(e) => setAddress({ ...address, pincode: e.target.value })}
              value={address.pincode}
              required
            />
            <textarea
              className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500 resize-none"
              rows={4}
              placeholder="Address (Area and Street)"
              onChange={(e) => setAddress({ ...address, area: e.target.value })}
              value={address.area}
              required
            ></textarea>
            <div className="flex space-x-3">
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="City/District/Town"
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                value={address.city}
                required
              />
              <input
                className="px-2 py-2.5 focus:border-orange-500 transition border border-gray-500/30 rounded outline-none w-full text-gray-500"
                type="text"
                placeholder="State"
                onChange={(e) => setAddress({ ...address, state: e.target.value })}
                value={address.state}
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="max-w-sm w-full mt-6 bg-orange-600 text-white py-3 hover:bg-orange-700 uppercase disabled:opacity-50 transition"
          >
            {loading ? "Saving..." : "Save address"}
          </button>
        </form>
        <Image
          className="md:mr-16 mt-16 md:mt-0"
          src={assets.my_location_image}
          alt="my_location_image"
        />
      </div>
      <Footer />
    </>
  );
};

export default AddAddress;