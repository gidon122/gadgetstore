'use client';
import React, { useEffect, useState } from "react";
import { assets } from "@/assets/assets";
import Image from "next/image";
import { useAppContext } from "@/context/AppContext";
import Footer from "@/components/seller/Footer";
import Loading from "@/components/Loading";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import toast from "react-hot-toast";

const Orders = () => {
    const { currency } = useAppContext();
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updatingId, setUpdatingId] = useState(null);

    const fetchSellerOrders = async () => {
        try {
            if (isLoaded && user) {
                const token = await getToken();
                const { data } = await axios.get("/api/seller/orders", {
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
            console.error("Failed to fetch seller orders:", error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            setUpdatingId(orderId);
            const token = await getToken();
            const { data } = await axios.patch(
                `/api/orders/${orderId}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                toast.success(`Order status updated to ${newStatus}`);
                setOrders((prev) =>
                    prev.map((ord) =>
                        ord._id === orderId || ord.orderNumber === orderId
                            ? { ...ord, status: newStatus, orderStatus: newStatus }
                            : ord
                    )
                );
            } else {
                toast.error(data.message || "Failed to update status");
            }
        } catch (error) {
            toast.error(
                error.response?.data?.message || error.message || "Failed to update status"
            );
        } finally {
            setUpdatingId(null);
        }
    };

    useEffect(() => {
        if (isLoaded) {
            if (user) {
                fetchSellerOrders();
            } else {
                setOrders([]);
                setLoading(false);
            }
        }
    }, [isLoaded, user]);

    return (
        <div className="flex-1 h-screen overflow-scroll flex flex-col justify-between text-sm">
            {loading ? (
                <Loading />
            ) : (
                <div className="md:p-10 p-4 space-y-5">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-medium">Customer Orders</h2>
                        <span className="text-xs text-gray-500">{orders.length} total orders</span>
                    </div>
                    {orders.length === 0 ? (
                        <div className="text-center py-20 text-gray-500">
                            <p className="text-base font-medium">No orders found.</p>
                            <p className="text-xs text-gray-400 mt-1">Customer orders will appear here once placed.</p>
                        </div>
                    ) : (
                        <div className="max-w-5xl rounded-md bg-white border border-gray-200">
                            {orders.map((order, index) => {
                                const orderAddress = order.address || order.shippingAddress || {};
                                const orderItems = order.items || [];
                                const totalAmount = order.totalAmount ?? order.amount ?? 0;
                                const orderDate = order.date || order.createdAt || Date.now();
                                const currentStatus = order.status || order.orderStatus || "pending";
                                const orderId = order._id || order.orderNumber || index;

                                return (
                                    <div
                                        key={orderId}
                                        className="flex flex-col md:flex-row gap-5 justify-between p-5 border-b border-gray-200 last:border-b-0 hover:bg-gray-50/50"
                                    >
                                        <div className="flex-1 flex gap-4 max-w-80">
                                            <Image
                                                className="w-14 h-14 object-cover shrink-0"
                                                src={assets.box_icon}
                                                alt="box_icon"
                                            />
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-xs text-orange-600">
                                                    {order.orderNumber ? `#${order.orderNumber}` : `Order #${index + 1}`}
                                                </span>
                                                <span className="font-medium line-clamp-2">
                                                    {orderItems
                                                        .map(
                                                            (item) =>
                                                                (item.product?.name || item.name || "Product") +
                                                                ` x ${item.quantity}`
                                                        )
                                                        .join(", ")}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    Items: {orderItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
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

                                        <div className="my-auto">
                                            <p className="font-semibold text-base text-gray-900">
                                                {currency}{totalAmount}
                                            </p>
                                            <span className="text-xs text-gray-500">
                                                {new Date(orderDate).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <div className="flex flex-col justify-center gap-2">
                                            <label className="text-xs text-gray-500 font-medium">Status</label>
                                            <select
                                                value={currentStatus}
                                                disabled={updatingId === order._id}
                                                onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                                className="border rounded px-3 py-1.5 bg-white text-xs font-medium focus:ring-1 focus:ring-orange-500 outline-none"
                                            >
                                                <option value="pending">Pending</option>
                                                <option value="processing">Processing</option>
                                                <option value="shipped">Shipped</option>
                                                <option value="delivered">Delivered</option>
                                                <option value="cancelled">Cancelled</option>
                                            </select>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
            <Footer />
        </div>
    );
};

export default Orders;