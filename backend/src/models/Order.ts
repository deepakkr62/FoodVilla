import { Document, Model, Schema, Types, model } from "mongoose";

export type OrderStatus =
  | "placed"
  | "accepted"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "card" | "cod";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface IOrderItem {
  dishId: Types.ObjectId;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  isVeg: boolean;
}

export interface IOrderAddress {
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export interface IOrderStatusEvent {
  status: OrderStatus;
  at: Date;
  note?: string;
}

export interface IOrder {
  customer: Types.ObjectId;
  restaurant: Types.ObjectId;
  items: IOrderItem[];
  pricing: {
    subtotal: number;
    taxes: number;
    deliveryFee: number;
    total: number;
  };
  deliveryAddress: IOrderAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  history: IOrderStatusEvent[];
  stripeSessionId?: string;
  stripePaymentIntentId?: string;
  placedAt: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderDocument extends IOrder, Document {}

const OrderItemSchema = new Schema<IOrderItem>(
  {
    dishId: { type: Schema.Types.ObjectId, ref: "Dish", required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    imageUrl: { type: String },
    isVeg: { type: Boolean, default: true },
  },
  { _id: false },
);

const OrderAddressSchema = new Schema<IOrderAddress>(
  {
    label: String,
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    state: String,
    postalCode: { type: String, required: true },
    country: { type: String, required: true, default: "IN" },
  },
  { _id: false },
);

const OrderStatusEventSchema = new Schema<IOrderStatusEvent>(
  {
    status: {
      type: String,
      enum: [
        "placed",
        "accepted",
        "preparing",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      required: true,
    },
    at: { type: Date, default: () => new Date() },
    note: String,
  },
  { _id: false },
);

const OrderSchema = new Schema<IOrderDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    items: { type: [OrderItemSchema], required: true, validate: (v: IOrderItem[]) => v.length > 0 },
    pricing: {
      subtotal: { type: Number, required: true, min: 0 },
      taxes: { type: Number, required: true, min: 0 },
      deliveryFee: { type: Number, required: true, min: 0 },
      total: { type: Number, required: true, min: 0 },
    },
    deliveryAddress: { type: OrderAddressSchema, required: true },
    paymentMethod: { type: String, enum: ["card", "cod"], required: true },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    status: {
      type: String,
      enum: ["placed", "accepted", "preparing", "out_for_delivery", "delivered", "cancelled"],
      default: "placed",
      index: true,
    },
    history: { type: [OrderStatusEventSchema], default: [] },
    stripeSessionId: { type: String, index: true },
    stripePaymentIntentId: { type: String },
    placedAt: { type: Date, default: () => new Date() },
    deliveredAt: { type: Date },
  },
  { timestamps: true },
);

OrderSchema.index({ createdAt: -1 });

export const VALID_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  placed: ["accepted", "cancelled"],
  accepted: ["preparing", "cancelled"],
  preparing: ["out_for_delivery", "cancelled"],
  out_for_delivery: ["delivered"],
  delivered: [],
  cancelled: [],
};

export const Order: Model<IOrderDocument> = model<IOrderDocument>("Order", OrderSchema);
export default Order;
