'use client';

import axios from "axios";
import { useAuth, useUser } from "@clerk/nextjs";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

export const AppContext = createContext<any>(null);

export const useAppContext = () => useContext(AppContext);

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
  const currency = process.env.NEXT_PUBLIC_CURRENCY || "$";
  const router = useRouter();

  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [userData, setUserData] = useState<any>(false);
  const [isSeller, setIsSeller] = useState(false);
  const [cartItems, setCartItems] = useState<Record<string, number>>({});

  const fetchProductData = async () => {
    setLoadingProducts(true);
    setProductsError(null);
    try {
      const { data } = await axios.get("/api/products");
      if (data.success && Array.isArray(data.products)) {
        setProducts(data.products);
      } else {
        // Fallback endpoint if needed
        const res = await axios.get("/api/product/list");
        if (res.data.success && Array.isArray(res.data.products)) {
          setProducts(res.data.products);
        } else {
          setProductsError(res.data.message || "Unable to load products. Please try again.");
          toast.error(res.data.message || "Unable to load products");
        }
      }
    } catch (error) {
      const errMsg = error instanceof Error ? error.message : "Unable to load products. Please try again.";
      setProductsError(errMsg);
      console.error("Failed to fetch products:", error);
    } finally {
      setLoadingProducts(false);
    }
  };

  const fetchUserData = async () => {
    try {
      if (!isLoaded || !user) return;

      if (user.publicMetadata?.role === "seller") {
        setIsSeller(true);
      }

      const token = await getToken();
      const { data } = await axios.get("/api/user/data", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setUserData(data.user);
        setCartItems(data.user?.cartItems || {});
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error("Failed to fetch user:", error);
    }
  };

  const addToCart = async (itemId: string, quantity: number = 1) => {
    const cartData: Record<string, number> = structuredClone(cartItems);
    cartData[itemId] = (cartData[itemId] || 0) + quantity;
    setCartItems(cartData);

    if (user) {
      try {
        const token = await getToken();
        const { data } = await axios.post(
          "/api/cart/add",
          { productId: itemId, quantity },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (data.success) {
          toast.success(data.message);
          if (data.cartItems) {
            setCartItems(data.cartItems);
          }
        } else {
          toast.error(data.message);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || "Failed to add to cart");
      }
    } else {
      toast.success("Item added to cart");
    }
  };

  const updateCartQuantity = async (itemId: string, quantity: number) => {
    const cartData: Record<string, number> = structuredClone(cartItems);

    if (quantity <= 0) {
      delete cartData[itemId];
    } else {
      cartData[itemId] = quantity;
    }

    setCartItems(cartData);

    if (user) {
      try {
        const token = await getToken();
        if (quantity <= 0) {
          await axios.delete("/api/cart/update", {
            data: { productId: itemId },
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          await axios.post(
            "/api/cart/update",
            { cartData },
            { headers: { Authorization: `Bearer ${token}` } }
          );
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || error.message || "Failed to update cart");
      }
    }
  };

  const getCartCount = () => {
    let totalCount = 0;

    for (const itemId in cartItems) {
      if (cartItems[itemId] > 0) {
        totalCount += cartItems[itemId];
      }
    }

    return totalCount;
  };

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const itemId in cartItems) {
      const qty = cartItems[itemId];
      if (qty <= 0) continue;

      const itemInfo = products.find((product) => product._id === itemId);
      if (!itemInfo) continue;

      const price = itemInfo.offerPrice !== undefined ? itemInfo.offerPrice : itemInfo.price;
      totalAmount += price * qty;
    }

    return Math.floor(totalAmount * 100) / 100;
  };

  useEffect(() => {
    fetchProductData();
  }, []);

  useEffect(() => {
    if (isLoaded && user) {
      fetchUserData();
    }
  }, [isLoaded, user]);

  const value = {
    user,
    getToken,
    currency,
    router,
    isSeller,
    setIsSeller,
    userData,
    fetchUserData,
    products,
    loadingProducts,
    productsError,
    fetchProductData,
    cartItems,
    setCartItems,
    addToCart,
    updateCartQuantity,
    getCartCount,
    getCartAmount,
  };

  return (
    <AppContext.Provider value={value}>
      <Toaster position="bottom-right" />
      {children}
    </AppContext.Provider>
  );
};