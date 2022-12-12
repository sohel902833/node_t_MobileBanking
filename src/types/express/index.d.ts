import { Request } from "express";
import { IUser } from "../../models/user.model";
import { IMainAccount } from "./../../models/mainaccount.model";

export interface IRequest extends Request {
  userId?: string;
  userRole?: string;
  mainAccount?: IMainAccount;
  user?: IUser;
}
