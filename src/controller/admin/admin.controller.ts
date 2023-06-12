import { NextFunction, Response } from "express";
import { Types } from "mongoose";
import MainAccount, { IMainAccount } from "../../models/mainaccount.model";
import Transection, { TransectionTypes } from "../../models/transection.model";
import User from "../../models/user.model";
import { updateMainAccountBalance } from "../../services/admin/account.service";
import {
  getAllUsersSignupHistoryForDate,
  getAllUsersSignupHistoryForDateRange,
  getAllUsersSignupHistoryForMonth,
  getAllUsersSignupHistoryForYear,
} from "../../services/admin/admin.service";
import { createTransection } from "../../services/transection/transection.service";
import { IRequest } from "../../types/express";
import { ADMIN_USER_TYPE } from "./../../models/user.model";
import { generateTransection } from "./../../services/transection/transection.service";
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
      senderIn: true,
      receiverIn: true,
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
    const mainAccounts = await MainAccount.find({});
    const adminCashInInfo = await Transection.aggregate([
      {
        $match: {
          senderUserType: ADMIN_USER_TYPE,
          receiverUserType: ADMIN_USER_TYPE,
          transectionType: TransectionTypes.CASHIN_TRANSECTION_TYPE,
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
        },
      },
    ]);

    const totalAdminCashIn = adminCashInInfo[0];

    const mainAccount: any = mainAccounts[0];
    let dashboardInfo: DashboardDataType | any = {};

    dashboardInfo.mainAccountBalance = mainAccount.balance || 0;
    dashboardInfo.totalAdminCashIn = totalAdminCashIn?.totalAmount || 0;
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

    res.status(200).json({ ...dashboardInfo });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const clearBalances = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await Transection.deleteMany({});
    await User.updateMany({}, { balance: 0 });
    await MainAccount.updateMany({}, { balance: 0, transections: [] });

    res.status(201).json({
      message: "Transections and accounts cleared.",
    });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const getUserTotalTransections = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = new Types.ObjectId(req.params.userId);
    const result = await Transection.aggregate([
      {
        $match: {
          $or: [
            {
              senderUser: userId,
            },
            { receiverUser: userId },
          ],
        },
      },
      {
        $group: {
          _id: null,
          totalCashIn: {
            $sum: {
              $cond: [{ $eq: ["$receiverUser", userId] }, "$amount", 0],
            },
          },
          totalCashOut: {
            $sum: {
              $cond: [{ $eq: ["$senderUser", userId] }, "$amount", 0],
            },
          },
        },
      },
    ]);

    let response: {
      totalCashIn: number;
      totalCashOut: number;
    } = {
      totalCashIn: 0,
      totalCashOut: 0,
    };
    if (result?.length > 0) {
      const data = result[0];
      if (data?.totalCashIn) {
        response.totalCashIn = data?.totalCashIn;
      }
      if (data?.totalCashOut) {
        response.totalCashOut = data?.totalCashOut;
      }
    }

    res.status(200).json({
      ...response,
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const getUserRegistrationChartInfo = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    let userType = req.params.userType;
    const by = req.query.by;
    let result: any = {
      filterBy: by,
    };
    if (by === "year") {
      const year = req.query.year as string;
      if (!year) {
        return res.status(200).json({
          message: "Please Choose Year",
        });
      }
      result.data = await getAllUsersSignupHistoryForYear(
        year.toString(),
        userType
      );
    } else if (by === "month") {
      const year = req.query.year as string;
      const month = req.query.month as string;
      if (!year || !month) {
        return res.status(200).json({
          message: "Please choose year and month",
        });
      }
      result.data = await getAllUsersSignupHistoryForMonth(
        year.toString(),
        month,
        userType
      );
    } else if (by === "day") {
      const date = req.query.date as string;
      if (!date) {
        return res.status(200).json({
          message: "Please choose date",
        });
      }
      result.data = await getAllUsersSignupHistoryForDate(date, userType);
    } else if (by === "range") {
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      if (!startDate || !endDate) {
        return res.status(200).json({
          message: "Please choose start and end date",
        });
      }
      result.data = await getAllUsersSignupHistoryForDateRange(
        startDate,
        endDate,
        userType
      );
    } else {
      return res.status(200).json({
        message: "Wrong Filter Provided",
      });
    }

    res.json({
      ...result,
    });
  } catch (err) {
    res.status(404).json({
      message: "Server error found.",
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
