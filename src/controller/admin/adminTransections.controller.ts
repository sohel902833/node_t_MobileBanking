import { NextFunction, Response } from "express";
import { TransectionTypes } from "../../models/transection.model";
import User, {
  ADMIN_USER_TYPE,
  AGENT_USER_TYPE,
  CUSTOMER_USER_TYPE,
} from "../../models/user.model";
import { updateMainAccountBalance } from "../../services/admin/account.service";
import {
  createManyTransections,
  generateTransection,
} from "../../services/transection/transection.service";
import { updateUserBalance } from "../../services/user/user.service";
import { IRequest } from "../../types/express";

export const sendBalanceToAgent = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let { agentId, amount, email } = req.body;

    if (!agentId && !email) {
      return res.status(200).json({
        message: "Receiver Not Found.",
      });
    }
    //check amount exists or not
    if (!amount) {
      return res.status(200).json({
        message: "Put Value.",
      });
    }
    amount = Number(amount);
    const mainAccount = req.mainAccount;
    const accountBalance = req.mainAccount?.balance as number;

    //fetch receiver Info
    const receiverData = await User.find({
      $or: [{ email: email }, { _id: agentId }],
    });

    //check receiver exists or not
    if (!(receiverData && receiverData.length > 0)) {
      return res.status(200).json({
        message: "Receiver Not Found.",
      });
    }

    //check sender receiver different or same
    const receiver = receiverData[0];

    //check receiver is agent or not
    if (receiver.userType !== AGENT_USER_TYPE) {
      return res.status(200).json({
        message: "Receiver Is not an agent",
      });
    }

    if (receiver._id.toString() === req.userId) {
      return res.status(200).json({
        message: "Sender And Receiver Is Same.",
      });
    }

    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
      });
    }

    //check sufficient balance is exists
    if (!(accountBalance >= amount)) {
      return res.status(200).json({
        message: "Insufficient Balance",
      });
    }
    //everything fine lets update account info

    //create transections
    const senderTransection = generateTransection({
      amount,
      transectionType: TransectionTypes.CASHIN_TRANSECTION_TYPE,
      description: "sent balance to agent account",
      receiverUserId: receiver._id.toString(),
      senderUserId: req.userId as string,
      receiverUserType: AGENT_USER_TYPE,
      senderUserType: ADMIN_USER_TYPE,
      senderIn: false,
      receiverIn: true,
    });
    const savedTransections = await createManyTransections([senderTransection]);
    //update main account balance
    const updatedBalance = accountBalance - amount;
    const updateMainAccount = await updateMainAccountBalance(
      mainAccount?._id?.toString() as string,
      updatedBalance,
      savedTransections[0]._id.toString()
    );
    //add balance to agent account
    const updatedAgentBalance = await updateUserBalance(
      receiver._id.toString(),
      receiver.balance + amount
    );

    //send balance successful.

    res
      .status(201)
      .json({ message: "Balance Sent Successful.", success: true });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const sendBalanceToUserAccount = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let { userId, amount, email } = req.body;

    if (!userId && !email) {
      return res.status(200).json({
        message: "Receiver Not Found.",
      });
    }
    //check amount exists or not
    if (!amount) {
      return res.status(200).json({
        message: "Put Value.",
      });
    }
    amount = Number(amount);
    const mainAccount = req.mainAccount;
    const accountBalance = req.mainAccount?.balance as number;
    //fetch receiver Info
    const receiverData = await User.find({
      $or: [{ email: email }, { _id: userId }],
    });

    //check receiver exists or not
    if (!(receiverData && receiverData.length > 0)) {
      return res.status(200).json({
        message: "Receiver Not Found.",
      });
    }

    //check sender receiver different or same
    const receiver = receiverData[0];

    //check receiver is agent or not
    if (receiver.userType !== CUSTOMER_USER_TYPE) {
      return res.status(200).json({
        message: "Receiver Is not an user",
      });
    }

    if (receiver._id.toString() === req.userId) {
      return res.status(200).json({
        message: "Sender And Receiver Is Same.",
      });
    }

    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
      });
    }

    //check sufficient balance is exists
    if (!(accountBalance >= amount)) {
      return res.status(200).json({
        message: "Insufficient Balance",
      });
    }
    //everything fine lets update account info

    //create transections
    const senderTransection = generateTransection({
      amount,
      transectionType: TransectionTypes.CASHIN_TRANSECTION_TYPE,
      description: "sent balance to user account",
      receiverUserId: receiver._id.toString(),
      senderUserId: req.userId as string,
      receiverUserType: CUSTOMER_USER_TYPE,
      senderUserType: ADMIN_USER_TYPE,
      senderIn: false,
      receiverIn: true,
    });
    const savedTransections = await createManyTransections([senderTransection]);
    //update main account balance
    const updatedBalance = accountBalance - amount;
    const updateMainAccount = await updateMainAccountBalance(
      mainAccount?._id?.toString() as string,
      updatedBalance,
      savedTransections[0]._id.toString()
    );
    //add balance to agent account
    const updatedAgentBalance = await updateUserBalance(
      receiver._id.toString(),
      receiver.balance + amount
    );

    //send balance successful.

    res
      .status(201)
      .json({ message: "Balance Sent Successful.", success: true });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};
