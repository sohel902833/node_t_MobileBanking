import { Request } from "express";
import { ISettings } from "../../models/settings.model";
import { IUser } from "../../models/user.model";
import { IMainAccount } from "./../../models/mainaccount.model";

export interface IRequest extends Request {
  userId?: string;
  userRole?: string;
  mainAccount?: IMainAccount;
  user?: IUser;
  appSetting?: ISettings;
}
