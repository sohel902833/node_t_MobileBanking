import { model, Schema, Types } from "mongoose";
import { USER_MODEL_NAME, VERIFY_CODE_MODEL } from "./modelConfig";

export interface ICode {
  user?: Types.ObjectId;
  code: number;
  expiry: number;
}

const verifycodeSchema = new Schema<ICode>(
  {
    user: {
      type: Types.ObjectId,
      ref: USER_MODEL_NAME,
      required: true,
    },
    code: {
      type: Number,
      required: true,
      trim: true,
    },
    expiry: {
      type: Number,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const VerifyCode = model<ICode>(VERIFY_CODE_MODEL, verifycodeSchema);

export default VerifyCode;
