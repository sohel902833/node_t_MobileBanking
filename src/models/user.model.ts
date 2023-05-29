import { model, Schema, Types } from "mongoose";
import { USER_MODEL_NAME } from "./modelConfig";

export const EMAIL_REGISTERED_TYPE = "email";
export const PHONE_REGISTEREDE_TYPE = "phone";
export const ADMIN_USER_TYPE = "admin";
export const AGENT_USER_TYPE = "agent";
export const CUSTOMER_USER_TYPE = "user";

export interface IUser {
  _id?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  birthdate: string;
  phone: string;
  password?: string;
  idNo?: string;
  balance?: number;
  avatar: {
    fileName: string;
    url: string;
  };
  cover: {
    fileName: string;
    url: string;
  };
  verified: boolean;
  tokens?: IToken[];
  registeredBy?: string;
  userType?: string;
}

export interface IToken {
  _id?: Types.ObjectId;
  device: string;
  token: string;
}

const userSchema = new Schema<IUser>(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    idNo: {
      type: String,
      required: true,
      trim: true,
    },
    birthdate: Date,
    phone: {
      type: String,
      default: "",
    },
    password: {
      type: String,
      required: true,
    },
    avatar: {
      fileName: {
        type: String,
        default: "none",
      },
      url: {
        type: String,
        default: "none",
      },
    },
    cover: {
      fileName: {
        type: String,
        default: "none",
      },
      url: {
        type: String,
        default: "none",
      },
    },
    verified: {
      type: Boolean,
      default: false,
      required: true,
    },
    tokens: [
      {
        device: {
          type: String,
        },
        token: {
          type: String,
        },
      },
    ],
    registeredBy: {
      type: String,
      required: true,
      default: EMAIL_REGISTERED_TYPE,
      enum: [EMAIL_REGISTERED_TYPE, PHONE_REGISTEREDE_TYPE],
    },
    balance: {
      required: true,
      default: 0,
      type: Number,
    },
    userType: {
      type: String,
      required: true,
      default: CUSTOMER_USER_TYPE,
      enum: [ADMIN_USER_TYPE, AGENT_USER_TYPE, CUSTOMER_USER_TYPE],
    },
  },
  {
    timestamps: true,
  }
);

const User = model<IUser>(USER_MODEL_NAME, userSchema);

export default User;
