import { NextFunction, Response } from "express";
import { CUSTOMER_USER_TYPE } from "../../models/user.model";
import {
  createManyTransections,
  generateTransection,
} from "../../services/transection/transection.service";
import { getUser, updateUserBalance } from "../../services/user/user.service";
import { IRequest } from "../../types/express";
import {
  BALANCE_ADDED_FROM_AGENT,
  CASHIN_TO_USER_ACCOUNT,
} from "../../types/transection/transectionTypes";

export const cashInToUserAccount = async (
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
    //check sender and receiver same
    if (sender?._id?.toString() === receiverId) {
      return res.status(200).json({
        message: "Sender And Receiver Is Same.",
      });
    }
    //check receiver user or not
    if (receiver.userType !== CUSTOMER_USER_TYPE) {
      return res.status(200).json({
        message: `You Can't Cashin To ${receiver.userType} Account`,
      });
    }

    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
      });
    }
    //receiver exists here
    //now check sufficient balance exists on sender account

    if (!((sender?.balance as number) >= amount)) {
      return res.status(200).json({
        message: "Insufficient Balance.",
      });
    }
    //sufficient balance exists
    const senderUpdateBalance = (sender?.balance as number) - amount;
    const receiverUpdateBalance = receiver.balance + amount;
    //generate transections
    const senderTransection = generateTransection(
      amount,
      false,
      CASHIN_TO_USER_ACCOUNT,
      sender?._id?.toString() as string
    );
    const receiverTransection = generateTransection(
      amount,
      true,
      BALANCE_ADDED_FROM_AGENT,
      receiver?._id?.toString()
    );
    //save transections
    const savedTransections = await createManyTransections([
      senderTransection,
      receiverTransection,
    ]);
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
      message: "Send Money Successful.",
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
    });
  }
};
