import { model, Schema, Types } from "mongoose";
import { TRANSECTION_MODEL, USER_MODEL_NAME } from "./modelConfig";

export enum TransectionTypes {
  CASHIN_TRANSECTION_TYPE = "cashin",
  CASHOUT_TRANSECTION_TYPE = "cashout",
  SEND_MONEY_TRANSECTION_TYPE = "sendmoney",
  PAYMENT_TRANSECTION_TYPE = "payment",
}

export interface ITransection {
  _id?: Types.ObjectId;
  amount: number;
  trxId: string;
  description: string;
  transectionType: string;
  senderUser?: string;
  receiverUser?: string;
  senderUserType: string;
  receiverUserType: string;
}

const TransectionSchema = new Schema<ITransection>(
  {
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    trxId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    senderUserType: {
      type: String,
      required: true,
    },
    receiverUserType: {
      type: String,
      required: true,
    },
    transectionType: {
      type: String,
      required: true,
      default: TransectionTypes.CASHIN_TRANSECTION_TYPE,
      enum: Object.values(TransectionTypes),
    },
    senderUser: {
      type: Types.ObjectId,
      required: true,
      ref: USER_MODEL_NAME,
    },
    receiverUser: {
      type: Types.ObjectId,
      required: true,
      ref: USER_MODEL_NAME,
    },
  },
  {
    timestamps: true,
  }
);

const Transection = model<ITransection>(TRANSECTION_MODEL, TransectionSchema);

export default Transection;
