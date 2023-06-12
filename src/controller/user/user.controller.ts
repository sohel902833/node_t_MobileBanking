import { NextFunction, Response } from "express";
import { TransectionTypes } from "../../models/transection.model";
import User, { CUSTOMER_USER_TYPE } from "../../models/user.model";
import {
  createManyTransections,
  generateTransection,
} from "../../services/transection/transection.service";
import { getUser, updateUserBalance } from "../../services/user/user.service";
import { IRequest } from "../../types/express";
import { userPublicValue } from "./userConfig";

export const getUserProfile = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req?.userId;

    const user = await User.findOne({ _id: userId }, userPublicValue);

    res.status(201).json(user);
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      error: err,
    });
  }
};

export const payment = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.userId;
    let { receiverId, amount } = req.body;

    //check required data entered or not
    if (!receiverId || !amount) {
      return res.status(200).json({ message: "Put Info" });
    }
    amount = Number(amount);
    //fetch sender info
    const sender = req.user;
    //fetch receiver info
    const receiver = await getUser({ _id: receiverId });
    //check receiver exists or not
    if (!receiver) {
      return res.status(200).json({
        message: "Receiver Not Found.",
      });
    }
    //receiver exists here
    //check sender and receiver same
    if (sender?._id?.toString() === receiverId) {
      return res.status(200).json({
        message: "Sender And Receiver Is Same.",
      });
    }
    //now check sufficient balance exists on sender account

    if (!((sender?.balance as number) >= amount)) {
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

    //sufficient balance exists
    const senderUpdateBalance = (sender?.balance as number) - amount;
    const receiverUpdateBalance = receiver.balance + amount;
    //generate transections
    const senderTransection = generateTransection({
      amount,
      transectionType: TransectionTypes.TRANSFER_TRANSECTION_TYPE,
      description: "payment",
      receiverUserId: receiver._id.toString(),
      senderUserId: req.userId as string,
      receiverUserType: receiver?.userType as string,
      senderUserType: sender?.userType as string,
      senderIn: false,
      receiverIn: true,
    });
    //save transections
    const savedTransections = await createManyTransections([senderTransection]);
    //update sender account
    const updatedSenderAccount = await updateUserBalance(
      sender?._id?.toString() as string,
      senderUpdateBalance
    );
    const updatedReceiverAccount = await updateUserBalance(
      receiver?._id?.toString() as string,
      receiverUpdateBalance
    );

    //send money done
    res.status(201).json({
      message: "Payment Successful.",
      success: true,
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
    });
  }
};

export const getAllUsers = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const users = await User.find(
      { userType: CUSTOMER_USER_TYPE },
      userPublicValue
    );
    res.status(201).json(users);
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      error: err,
    });
  }
};
