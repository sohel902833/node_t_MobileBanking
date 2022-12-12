import { model, Schema, Types } from "mongoose";
import { TRANSECTION_MODEL, USER_MODEL_NAME } from "./modelConfig";

export const CASHOUT_TRANSECTION_TYPE = "CASHOUT";
export const CASHIN_TRANSECTION_TYPE = "CASHIN";

export interface ITransection {
  _id?: Types.ObjectId;
  amount: number;
  trxId: string;
  text: string;
  transectionType: string;
  user?: string;
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
    text: {
      type: String,
      required: true,
    },
    transectionType: {
      type: String,
      required: true,
      default: CASHIN_TRANSECTION_TYPE,
      enum: [CASHIN_TRANSECTION_TYPE, CASHOUT_TRANSECTION_TYPE],
    },
    user: {
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
