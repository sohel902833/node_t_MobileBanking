import { model, Schema, Types } from "mongoose";
import { SETTINGS_MODEL } from "./modelConfig";

export interface ISettings {
  _id?: Types.ObjectId;
  registrationBonous: number;
  cashoutCharge: number;
  sendMoneyCharge: number;
  agentCashoutProfit: number;
}

const SettingsSchema = new Schema<ISettings>(
  {
    registrationBonous: {
      type: Number,
      required: true,
      default: 0,
    },
    cashoutCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    sendMoneyCharge: {
      type: Number,
      required: true,
      default: 0,
    },
    agentCashoutProfit: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Settings = model<ISettings>(SETTINGS_MODEL, SettingsSchema);

export default Settings;
