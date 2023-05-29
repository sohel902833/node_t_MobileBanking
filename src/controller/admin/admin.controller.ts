import { NextFunction, Response } from "express";
import MainAccount, { IMainAccount } from "../../models/mainaccount.model";
import { TransectionTypes } from "../../models/transection.model";
import User, {
  ADMIN_USER_TYPE,
  AGENT_USER_TYPE,
} from "../../models/user.model";
import { updateMainAccountBalance } from "../../services/admin/account.service";
import { createTransection } from "../../services/transection/transection.service";
import { updateUserBalance } from "../../services/user/user.service";
import { IRequest } from "../../types/express";
import {
  createManyTransections,
  generateTransection,
} from "./../../services/transection/transection.service";
import { DashboardDataType, IUserStatsItem } from "./admin.types";

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
        success: false,
      });
    }
    amount = Number(amount);
    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
        success: false,
      });
    }

    const userId = req.userId;
    //generate new transection
    const transection = generateTransection({
      amount,
      transectionType: TransectionTypes.CASHIN_TRANSECTION_TYPE,
      description: TransectionTypes.CASHIN_TRANSECTION_TYPE,
      receiverUserId: userId as string,
      senderUserId: userId as string,
      receiverUserType: ADMIN_USER_TYPE,
      senderUserType: ADMIN_USER_TYPE,
    });
    //save the transections
    const savedTransection = await createTransection(transection);
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
        success: true,
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
    const senderTransection = generateTransection({
      amount,
      transectionType: TransectionTypes.CASHIN_TRANSECTION_TYPE,
      description: "sent balance to agent account",
      receiverUserId: receiver._id.toString(),
      senderUserId: req.userId as string,
      receiverUserType: AGENT_USER_TYPE,
      senderUserType: ADMIN_USER_TYPE,
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
export const getDashboardInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userStats: IUserStatsItem[] = await User.aggregate([
      {
        $group: {
          _id: "$userType",
          count: { $sum: 1 },
          balanceSum: { $sum: "$balance" },
        },
      },
      {
        $project: {
          userType: "$_id",
          count: 1,
          balanceSum: 1,
          _id: 0,
        },
      },
    ]);
    let dashboardInfo: DashboardDataType | any = {};
    userStats.forEach((item) => {
      if (item.userType === "admin") {
        dashboardInfo.totalAdminCount = item.count;
      } else if (item.userType === "agent") {
        dashboardInfo.totalAgentCount = item.count;
        dashboardInfo.totalAgentBalance = item.balanceSum;
      } else if (item.userType === "user") {
        dashboardInfo.totalUser = item.count;
        dashboardInfo.totalUserBalance = item.balanceSum;
      }
    });

    res.status(200).json(dashboardInfo);
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
