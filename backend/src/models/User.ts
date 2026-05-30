import { Document, Model, Schema, Types, model } from "mongoose";
import bcrypt from "bcryptjs";

export type UserRole = "customer" | "restaurant_owner";

export interface IAddress {
  _id?: Types.ObjectId;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

export interface IUser {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone?: string;
  addresses?: IAddress[];
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserDocument extends IUser, Document {
  comparePassword(plain: string): Promise<boolean>;
  toSafeJSON(): Omit<IUser, "password"> & { id: string };
}

const AddressSchema = new Schema<IAddress>(
  {
    label: { type: String, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, default: "IN", trim: true },
    isDefault: { type: Boolean, default: false },
  },
  { _id: true },
);

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[\w-.+]+@([\w-]+\.)+[\w-]{2,}$/, "Invalid email"],
    },
    password: { type: String, required: true, select: false, minlength: 8 },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    role: {
      type: String,
      enum: ["customer", "restaurant_owner"],
      default: "customer",
      required: true,
    },
    phone: { type: String, trim: true },
    addresses: { type: [AddressSchema], default: [] },
    avatarUrl: { type: String, trim: true },
  },
  { timestamps: true },
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = async function (plain: string) {
  return bcrypt.compare(plain, this.password);
};

UserSchema.methods.toSafeJSON = function () {
  const obj = this.toObject({ versionKey: false });
  delete obj.password;
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

export const User: Model<IUserDocument> =
  (model as unknown as Model<IUserDocument>) &&
  (model<IUserDocument>("User", UserSchema) as Model<IUserDocument>);

export default User;
