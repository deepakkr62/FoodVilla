import { Document, Model, Schema, Types, model } from "mongoose";

export interface IReview {
  customer: Types.ObjectId;
  restaurant: Types.ObjectId;
  order: Types.ObjectId;
  rating: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IReviewDocument extends IReview, Document {}

const ReviewSchema = new Schema<IReviewDocument>(
  {
    customer: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    restaurant: { type: Schema.Types.ObjectId, ref: "Restaurant", required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true },
);

// One review per order — prevents double-submission.
ReviewSchema.index({ customer: 1, order: 1 }, { unique: true });
ReviewSchema.index({ restaurant: 1, createdAt: -1 });

export const Review: Model<IReviewDocument> = model<IReviewDocument>("Review", ReviewSchema);
export default Review;
