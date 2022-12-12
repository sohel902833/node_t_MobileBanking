import { model, Schema, Types } from "mongoose";
import { MAIN_ACCOUNT_MODEL, TRANSECTION_MODEL } from "./modelConfig";

export interface IMainAccount {
  _id?: Types.ObjectId;
  balance: number;
  transections: IMainTransections[];
}
export interface IMainTransections {
  transection: Types.ObjectId;
}

const mainAccountSchema = new Schema<IMainAccount>(
  {
    balance: {
      type: Number,
      required: true,
      default: 0,
    },
    transections: [
      {
        transection: {
          required: true,
          type: Types.ObjectId,
          ref: TRANSECTION_MODEL,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const MainAccount = model<IMainAccount>(MAIN_ACCOUNT_MODEL, mainAccountSchema);

export default MainAccount;
