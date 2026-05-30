import { Document, Model, Schema, Types, model } from "mongoose";

export interface IRestaurantLocation {
  type: "Point";
  coordinates: [number, number]; // [lng, lat]
}

const PointSchema = new Schema<IRestaurantLocation>(
  {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
  { _id: false },
);

export interface IRestaurant {
  owner: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  cuisines: string[];
  priceRange: 1 | 2 | 3 | 4;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  location?: IRestaurantLocation;
  coverImageUrl?: string;
  bannerImageUrl?: string;
  rating: { average: number; count: number };
  deliveryFee: number;
  minOrder: number;
  prepTimeMinutes: number;
  isOpen: boolean;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRestaurantDocument extends IRestaurant, Document {}

const RestaurantSchema = new Schema<IRestaurantDocument>(
  {
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    description: { type: String, trim: true, maxlength: 1000 },
    cuisines: {
      type: [String],
      default: [],
      validate: (v: string[]) => v.length <= 8,
    },
    priceRange: { type: Number, enum: [1, 2, 3, 4], default: 2 },
    address: {
      line1: { type: String, required: true, trim: true },
      line2: { type: String, trim: true },
      city: { type: String, required: true, trim: true, index: true },
      state: { type: String, trim: true },
      postalCode: { type: String, required: true, trim: true },
      country: { type: String, required: true, default: "IN", trim: true },
    },
    location: { type: PointSchema, default: undefined },
    coverImageUrl: { type: String, trim: true },
    bannerImageUrl: { type: String, trim: true },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0, min: 0 },
    },
    deliveryFee: { type: Number, default: 0, min: 0 },
    minOrder: { type: Number, default: 0, min: 0 },
    prepTimeMinutes: { type: Number, default: 30, min: 5, max: 180 },
    isOpen: { type: Boolean, default: true },
    isApproved: { type: Boolean, default: true }, // auto-approve in v1
  },
  { timestamps: true },
);

RestaurantSchema.index({ location: "2dsphere" });
RestaurantSchema.index({ name: "text", description: "text", cuisines: "text" });

export const Restaurant: Model<IRestaurantDocument> = model<IRestaurantDocument>(
  "Restaurant",
  RestaurantSchema,
);

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

export default Restaurant;
