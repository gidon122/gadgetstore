import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
      index: true,
    },
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    pincode: {
      type: String,
      required: [true, "Pincode is required"],
      trim: true,
    },
    area: {
      type: String,
      required: [true, "Area and street address is required"],
      trim: true,
    },
    city: {
      type: String,
      required: [true, "City is required"],
      trim: true,
    },
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },
    country: {
      type: String,
      default: "United States",
      trim: true,
    },
  },
  { timestamps: true }
);

const Address =
  mongoose.models.Address ||
  mongoose.models.address ||
  mongoose.model("Address", addressSchema);

export default Address;
