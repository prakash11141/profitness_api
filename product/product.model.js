import mongoose from "mongoose";
// set rule
const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 55,
    },
    brand: {
      type: String,
      trim: true,
      maxlength: 55,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      enum: [
        "Treadmill",
        "Cross-Trainer",
        "Home-Gym",
        "Cycle",
        "Dumbbell",
        "Other",
      ],
    },
    freeShipping: {
      type: Boolean,
      required: false,
      default: false,
    },
    sellerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    image: {
      type: String,
      required: false,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// to remove sellerId field
productSchema.methods.toJSON = function () {
  let obj = this.toObject();
  delete obj.sellerId;
  return obj;
};

// create table
const Product = mongoose.model("Product", productSchema);
export default Product;
