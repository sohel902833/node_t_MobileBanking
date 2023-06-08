import { compare } from "bcrypt";
import { NextFunction, Response } from "express";
import User, { CUSTOMER_USER_TYPE } from "../../models/user.model";
import { IRequest } from "../../types/express";

export const validateUserToUserSendMoneyRequest = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, phone, password } = req.body;

    const dbPassword = req.user?.password as string;
    const userId = req.user?._id;
    const currentAmount = req.user?.balance || 0;

    const isValidPassword = await compare(password as string, dbPassword);

    //check password valid or not
    if (!isValidPassword) {
      return res.status(200).json({
        message: "Password Doesn't Matched.",
      });
    }
    //check balance

    if (!(currentAmount >= amount)) {
      return res.status(200).json({
        message: "Insufficient Balance.",
      });
    }
    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
      });
    }

    const receiver = await User.findOne({ phone: phone });
    if (!receiver) {
      return res.status(200).json({
        message: "Receiver not found.",
      });
    }
    // check receiver is user

    if (receiver.userType !== CUSTOMER_USER_TYPE) {
      return res.status(200).json({
        message: "Requested user is not an user",
      });
    }

    res.status(201).json({
      message: "fine",
      success: true,
      meta: {
        receiverPhone: phone,
        amount,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      error: err,
    });
  }
};
