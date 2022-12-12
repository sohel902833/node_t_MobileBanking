import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import User, { IToken, IUser } from "../models/user.model";
import { IRequest } from "../types/express";
import { CUSTOMER_USER_TYPE } from "./../models/user.model";

export const authGard = (acceptUsers: string[] = [CUSTOMER_USER_TYPE]) => {
  return async (req: IRequest, res: Response, next: NextFunction) => {
    try {
      const { authorization: token } = req.headers;
      //check token exists or not
      if (!token) {
        return res.status(404).json({
          message: "Authentication Error.",
          errorFor: "auth",
        });
      }
      //check token verified or not
      const decoded: any = verify(token, process.env.USER_JWT_SECRET as string);
      const dbUser: IUser | null = await User.findOne({ _id: decoded.userId });
      if (!dbUser) {
        return res.status(200).json({
          message: "Requested User Was Not Found.",
        });
      }
      //user exists on database check token is same or not
      let tokenMatched = false;
      dbUser.tokens?.forEach((t: IToken) => {
        if (t.token === token) {
          tokenMatched = true;
        }
      });
      if (!tokenMatched) {
        return res.status(404).json({
          message: "Token Overlaped By Another",
          errorFor: "auth",
        });
      }
      if (!acceptUsers.includes(dbUser.userType as string)) {
        return res.status(404).json({
          message: "You Are Not Authorize To Perform This Action",
        });
      }

      req.userId = decoded.userId;
      req.user = dbUser;
      next();
    } catch (err: any) {
      res.status(404).json({
        message: err.message,
        errorFor: "auth",
      });
    }
  };
};
