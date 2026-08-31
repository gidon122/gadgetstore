'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import Loading from "@/components/Loading";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";

const MyOrders = () => {
    const { currency, router } = useAppContext();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        try {
            if (isLoaded && user) {
                const token = await getToken();
                const { data } = await axios.get("/api/orders", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (data.success && Array.isArray(data.orders)) {
                    setOrders(data.orders);
                    setLoading(false);
                    return;
                }
            }
            setOrders([]);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user) {
                fetchOrders();
            } else {
                setOrders([]);
                setLoading(false);
            }
        }
    }, [isLoaded, user]);

    return (
        <>
            <Navbar />
            <div className="flex flex-col justify-between px-6 md:px-16 lg:px-32 py-6 min-h-screen">
                <div className="space-y-5">
                    <h2 className="text-lg font-medium mt-6">My Orders</h2>
                    {loading ? (
                        <Loading />
                    ) : !user ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl">Please sign in to view your orders.</p>
                        </div>
                    ) : orders.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-xl">You have not placed any orders yet.</p>
                            <button
                                onClick={() => router.push("/all-products")}
                                className="mt-4 px-6 py-2 bg-orange-600 text-white rounded hover:bg-orange-700 transition"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        <div className="max-w-5xl border-t border-gray-300 text-sm">
                            {orders.map((order, index) => {
                                const orderAddress = order.address || order.shippingAddress || {};
                                const orderItems = order.items || [];
                                const totalAmount = order.totalAmount ?? order.amount ?? 0;
                                const orderDate = order.date || order.createdAt || Date.now();
                                const status = order.status || order.orderStatus || "pending";
                                const paymentStatus = order.paymentStatus || "pending";
                                const paymentMethod = order.paymentMethod || "COD";

                                return (
                                    <div
                                        key={order._id || order.orderNumber || index}
                                        className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-300 hover:bg-gray-50 transition"
                                    >
                                        <div className="flex-1 flex gap-5 max-w-80">
                                            <Image
                                                className="max-w-16 max-h-16 object-cover"
                                                src={assets.box_icon}
                                                alt="box_icon"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-xs text-orange-600">
                                                    {order.orderNumber ? `#${order.orderNumber}` : `Order #${index + 1}`}
                                                </span>
                                                <span className="font-medium text-base text-gray-800 line-clamp-2">
                                                    {orderItems
                                                        .map(
                                                            (item) =>
                                                                (item.product?.name || item.name || "Product") +
                                                                ` x ${item.quantity}`
                                                        )
                                                        .join(", ")}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Items : {orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-700">
                                                <span className="font-medium">{orderAddress.fullName || "Customer"}</span>
                                                <br />
                                                <span>{orderAddress.area || ""}</span>
                                                <br />
                                                <span>{`${orderAddress.city || ""}${orderAddress.city && orderAddress.state ? ", " : ""}${orderAddress.state || ""}`}</span>
                                                <br />
                                                <span>{orderAddress.phoneNumber || ""}</span>
                                            </p>
                                        </div>
                                        <p className="font-semibold my-auto text-base text-gray-900">
                                            {currency}
                                            {totalAmount}
                                        </p>
                                        <div>
                                            <p className="flex flex-col text-xs space-y-1">
                                                <span>
                                                    <strong className="text-gray-600">Method:</strong> {paymentMethod}
                                                </span>
                                                <span>
                                                    <strong className="text-gray-600">Date:</strong>{" "}
                                                    {new Date(orderDate).toLocaleDateString()}
                                                </span>
                                                <span>
                                                    <strong className="text-gray-600">Payment:</strong>{" "}
                                                    <span className={`capitalize font-medium ${paymentStatus.toLowerCase() === "paid" ? "text-green-600" : "text-amber-600"}`}>
                                                        {paymentStatus}
                                                    </span>
                                                </span>
                                                <span>
                                                    <strong className="text-gray-600">Status:</strong>{" "}
                                                    <span className={`capitalize font-medium ${status.toLowerCase() === "delivered" ? "text-green-600" : status.toLowerCase() === "cancelled" ? "text-red-600" : "text-blue-600"}`}>
                                                        {status}
                                                    </span>
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
};

export default MyOrders;