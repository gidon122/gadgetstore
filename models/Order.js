import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product: {
      _id: { type: String, required: true },
      userId: { type: String },
      name: { type: String, required: true },
      description: { type: String },
      price: { type: Number, required: true },
      offerPrice: { type: Number, required: true },
      image: { type: Array, required: true },
      category: { type: String },
    },
    productId: { type: String, required: true },
    name: { type: String },
    image: { type: Array },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }, // Price snapshot at time of purchase
    subtotal: { type: Number, required: true },
  },
  { _id: true }
);

const orderAddressSchema = new mongoose.Schema(
  {
    _id: { type: String },
    userId: { type: String },
    fullName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    pincode: { type: String, required: true },
    area: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, default: "United States" },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(val) => Array.isArray(val) && val.length > 0, "Order must contain at least one item"],
    },
    amount: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    address: {
      type: orderAddressSchema,
      required: true,
    },
    shippingAddress: {
      type: orderAddressSchema,
      required: true,
    },
    status: {
      type: String,
      enum: ["Order Placed", "pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    orderStatus: {
      type: String,
      enum: ["Order Placed", "pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentMethod: {
      type: String,
      default: "COD",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "pending", "Paid", "paid", "Failed", "failed"],
      default: "pending",
      index: true,
    },
    date: {
      type: Number,
      default: () => Date.now(),
    },
  },
  { timestamps: true }
);

// Pre-save hook to ensure amount/totalAmount, address/shippingAddress, and status/orderStatus aliases are synchronized
orderSchema.pre("save", function () {
  if (this.totalAmount === undefined && this.amount !== undefined) {
    this.totalAmount = this.amount;
  }
  if (this.amount === undefined && this.totalAmount !== undefined) {
    this.amount = this.totalAmount;
  }
  if (!this.shippingAddress && this.address) {
    this.shippingAddress = this.address;
  }
  if (!this.address && this.shippingAddress) {
    this.address = this.shippingAddress;
  }
  if (!this.orderStatus && this.status) {
    this.orderStatus = this.status;
  }
  if (!this.status && this.orderStatus) {
    this.status = this.orderStatus;
  }
});

const Order =
  mongoose.models.Order ||
  mongoose.models.order ||
  mongoose.model("Order", orderSchema);

export default Order;
