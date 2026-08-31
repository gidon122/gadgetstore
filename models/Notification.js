import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    type: {
      type: String,
      enum: ["order", "new_product", "cart", "general", "system"],
      default: "order",
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    read: {
      type: Boolean,
      default: false,
      index: true,
    },
    orderId: {
      type: String,
      default: null,
    },
    orderNumber: {
      type: String,
      default: null,
    },
    productId: {
      type: String,
      default: null,
    },
    productName: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification ||
  mongoose.models.notification ||
  mongoose.model("Notification", notificationSchema);

export default Notification;
