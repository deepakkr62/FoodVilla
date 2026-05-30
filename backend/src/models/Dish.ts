import { Document, Model, Schema, Types, model } from "mongoose";

export interface IDish {
  restaurant: Types.ObjectId;
  name: string;
  description?: string;
  category: string;
  price: number;
  imageUrl?: string;
  isVeg: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface IDishDocument extends IDish, Document {}

const DishSchema = new Schema<IDishDocument>(
  {
    restaurant: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    category: { type: String, required: true, trim: true, default: "Main" },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, trim: true },
    isVeg: { type: Boolean, default: true },
    isAvailable: { type: Boolean, default: true },
    isPopular: { type: Boolean, default: false },
    tags: {
      type: [String],
      default: [],
      validate: (v: string[]) => v.length <= 10,
    },
  },
  { timestamps: true },
);

DishSchema.index({ restaurant: 1, category: 1 });
DishSchema.index({ name: "text", description: "text", tags: "text" });

export const Dish: Model<IDishDocument> = model<IDishDocument>("Dish", DishSchema);
export default Dish;
