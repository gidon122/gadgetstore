import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    id: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    imageUrl: {
      type: String,
      default: "",
    },
    cartItems: {
      type: Object,
      default: () => ({}),
    },
  },
  { minimize: false, timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;