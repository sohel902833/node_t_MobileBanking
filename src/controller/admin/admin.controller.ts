import { NextFunction, Response } from "express";
import MainAccount, { IMainAccount } from "../../models/mainaccount.model";
import User, { AGENT_USER_TYPE } from "../../models/user.model";
import { updateMainAccountBalance } from "../../services/admin/account.service";
import { createTransection } from "../../services/transection/transection.service";
import { updateUserBalance } from "../../services/user/user.service";
import { IRequest } from "../../types/express";
import {
  ADD_BALANCE_BY_ADMIN_TO_MAIN_ACCOUNT,
  RECEIVED_BALANCE_FROM_ADMIN,
  SENT_BALANCE_TO_AGENT,
} from "../../types/transection/transectionTypes";
import {
  createManyTransections,
  generateTransection,
} from "./../../services/transection/transection.service";

export const addBalanceInMainAccount = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let { amount } = req.body;
    if (!amount) {
      return res.status(200).json({
        message: "Put Info",
      });
    }
    amount = Number(amount);
    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
      });
    }

    const userId = req.userId;
    //generate new transection
    const senderTransection = generateTransection(
      amount,
      true,
      ADD_BALANCE_BY_ADMIN_TO_MAIN_ACCOUNT,
      userId?.toString() as string
    );
    //save the transections
    const savedTransection = await createTransection(senderTransection);
    const dbMainAccount = await MainAccount.find();

    if (dbMainAccount && dbMainAccount.length > 0) {
      const dbAccount = dbMainAccount[0];
      //update account info
      const newBalance = dbAccount.balance + amount;

      const updatedAccount = await updateMainAccountBalance(
        dbAccount._id.toString(),
        newBalance,
        savedTransection._id.toString()
      );
      //end response
      res.status(201).json({
        message: "Balance Added.",
      });
    } else {
      //no data added till now,, need to create first
      const account: IMainAccount = {
        balance: amount,
        transections: [
          {
            transection: savedTransection._id,
          },
        ],
      };

      const newMainAccount = new MainAccount(account);
      const savedAccount = await newMainAccount.save();
      res.status(201).json({
        message: "Balance Added.",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const pushMainAccount = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dbMainAccount = await MainAccount.find();

    if (dbMainAccount && dbMainAccount.length > 0) {
      const dbAccount = dbMainAccount[0];
      req.mainAccount = dbAccount;
      next();
    } else {
      res.status(200).json({
        message: "Insufficient Balance",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};
export const getAdminAccountInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const dbMainAccount = await MainAccount.find();

    if (dbMainAccount && dbMainAccount.length > 0) {
      const dbAccount = dbMainAccount[0];
      res.status(201).json({
        message: "Account Balance Is " + dbAccount.balance,
        balance: dbAccount.balance,
      });
    } else {
      res.status(200).json({
        message: "Account not created.",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

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
    const senderTransection = generateTransection(
      amount,
      false,
      SENT_BALANCE_TO_AGENT,
      req.userId as string
    );
    const receiverTransection = generateTransection(
      amount,
      true,
      RECEIVED_BALANCE_FROM_ADMIN,
      receiver._id.toString()
    );
    const savedTransections = await createManyTransections([
      senderTransection,
      receiverTransection,
    ]);
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

    console.log(savedTransections);
    //send balance successful.

    res.status(201).json({ message: "Balance Sent Successful." });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const markup = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};
