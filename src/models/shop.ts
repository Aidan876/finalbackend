import mongoose, { InferSchemaType } from "mongoose";

const menuItemsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    default: () => new mongoose.Types.ObjectId(),
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});

export type MenuItemsType = InferSchemaType<typeof menuItemsSchema>;

const shopSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  shopName: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  deliveryPrice: { type: Number, required: true },
  estimatedDeliveryTime: { type: Number, required: true },
  filters: [{ type: String, required: true }],
  menuItems: [menuItemsSchema],
  imageUrl: { type: String, required: true },
  lastUpdated: { type: Date, required: true },
});

const Shop = mongoose.model("Shop", shopSchema);
export default Shop;
