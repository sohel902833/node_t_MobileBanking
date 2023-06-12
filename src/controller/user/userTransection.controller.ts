import { compare } from "bcrypt";
import { NextFunction, Response } from "express";
import { SEND_MONEY_TOKEN_EXPIRY } from "../../../secrets";
import MainAccount from "../../models/mainaccount.model";
import { TransectionTypes } from "../../models/transection.model";
import User, {
  AGENT_USER_TYPE,
  CUSTOMER_USER_TYPE,
} from "../../models/user.model";
import {
  getSendMoneyConfirmToken,
  parseSendMoneyConfirmToken,
} from "../../services/jwt/jwt.service";
import {
  createManyTransections,
  generateTransection,
} from "../../services/transection/transection.service";
import { getUser, updateUserBalance } from "../../services/user/user.service";
import { IRequest } from "../../types/express";
import { ADMIN_USER_TYPE } from "./../../models/user.model";
import { updateMainAccountBalance } from "./../../services/admin/account.service";

export const validateUserToUserSendMoneyRequest = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { amount, phone, password } = req.body;
    if (!amount || !phone || !password) {
      return res.status(200).json({
        message: "Please Enter All Info",
        success: false,
      });
    }

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
        message: "Requested id is not an user",
      });
    }

    //generate a transection token with user info

    const data = {
      receiverPhone: phone,
      amount,
      senderId: req.userId,
      expiry: SEND_MONEY_TOKEN_EXPIRY,
      availableBalance: currentAmount - amount,
      charge: 0,
    };
    const token = getSendMoneyConfirmToken(data);

    res.status(201).json({
      message: "fine",
      success: true,
      meta: data,
      token,
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      error: err,
    });
  }
};

export const sendMoney = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.userId;
    const token = req.params.token;

    let {
      receiverPhone,
      amount,
      senderId: tokenSenderId,
      error,
    } = parseSendMoneyConfirmToken(token);

    if (error) {
      return res.status(200).json({
        message: "Session timeout",
      });
    }
    //check required data entered or not
    if (!receiverPhone || !amount) {
      return res.status(200).json({ message: "Put Info" });
    }
    amount = Number(amount);
    //fetch sender info
    const sender = req.user;
    //fetch receiver info
    const receiver = await getUser({ phone: receiverPhone });
    //check receiver exists or not
    if (!receiver) {
      return res.status(200).json({
        message: "Receiver Not Found.",
      });
    }
    //check token sender and current user same
    if (tokenSenderId !== senderId) {
      return res.status(200).json({
        message: "You are not authorize to perform this action",
      });
    }
    //receiver exists here
    //check sender and receiver same
    if (sender?._id?.toString() === receiver?._id?.toString()) {
      return res.status(200).json({
        message: "Sender And Receiver Is Same.",
      });
    }
    //check receiver user or not
    if (receiver.userType !== CUSTOMER_USER_TYPE) {
      return res.status(200).json({
        message: `You Can't Sent Balance To ${receiver.userType}`,
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
    const newTransection = generateTransection({
      amount,
      transectionType: TransectionTypes.TRANSFER_TRANSECTION_TYPE,
      description: "sent money",
      receiverUserId: receiver._id.toString(),
      senderUserId: req.userId as string,
      receiverUserType: receiver.userType,
      senderUserType: sender?.userType as string,
      senderIn: false,
      receiverIn: true,
    });
    //save transections
    const savedTransections = await createManyTransections([newTransection]);
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
      success: true,
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
    });
  }
};

export const cashOutToAgent = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.userId;
    let { receiverId, amount } = req.body;
    const appSetting = req.appSetting;

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
    //check receiver user or not
    if (receiver.userType !== AGENT_USER_TYPE) {
      return res.status(200).json({
        message: `You Can't Cashout To ${receiver.userType}`,
      });
    }

    //check proper amount is here
    if (amount <= 0) {
      return res.status(200).json({
        message: "Wrong Amount.",
      });
    }

    const totalCharge = (amount * Number(appSetting?.cashoutCharge)) / 100;

    const totalAmount = amount + totalCharge;

    //now check sufficient balance exists on sender account
    if ((sender?.balance as number) <= totalAmount) {
      return res.status(200).json({
        message: "Insufficient Balance.",
      });
    }

    //sufficient balance exists
    const senderUpdateBalance = (sender?.balance as number) - totalAmount;
    const adminUsers = await User.find({ userType: ADMIN_USER_TYPE });
    const admin = adminUsers[0];
    //generate transections
    const senderTransection = generateTransection({
      amount,
      transectionType: TransectionTypes.CASHOUT_TRANSECTION_TYPE,
      description: "cashout",
      receiverUserId: receiver._id.toString(),
      senderUserId: req.userId as string,
      receiverUserType: receiver.userType,
      senderUserType: sender?.userType as string,
      senderIn: false,
      receiverIn: true,
    });
    const senderCashoutChargeTransection = generateTransection({
      amount: Number(totalCharge),
      transectionType: TransectionTypes.CHARGE_TRANSECTION_TYPE,
      description: "cashout charge",
      receiverUserId: admin._id?.toString(),
      senderUserId: req.userId as string,
      receiverUserType: ADMIN_USER_TYPE,
      senderUserType: sender?.userType as string,
      senderIn: false,
      receiverIn: true,
    });

    const agentProfit =
      (totalCharge * Number(appSetting?.agentCashoutProfit)) / 100;
    const mainProfit = totalCharge - agentProfit;

    const agentProfitTransection = generateTransection({
      amount: Number(agentProfit),
      transectionType: TransectionTypes.CHARGE_TRANSECTION_TYPE,
      description: "cashout profit",
      receiverUserId: receiver._id.toString(),
      senderUserId: admin._id.toString(),
      receiverUserType: AGENT_USER_TYPE,
      senderUserType: sender?.userType as string,
      senderIn: false,
      receiverIn: true,
    });
    const mainProfitTransection = generateTransection({
      amount: Number(mainProfit),
      transectionType: TransectionTypes.CHARGE_TRANSECTION_TYPE,
      description: "cashout profit",
      receiverUserId: admin._id.toString(),
      senderUserId: admin._id.toString(),
      receiverUserType: ADMIN_USER_TYPE,
      senderUserType: ADMIN_USER_TYPE,
      senderIn: true,
      receiverIn: true,
    });
    const receiverUpdateBalance = receiver.balance + amount + agentProfit;

    //save transections
    const savedTransections = await createManyTransections([
      senderTransection,
      senderCashoutChargeTransection,
      agentProfitTransection,
      mainProfitTransection,
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
    const mainAccounts = await MainAccount.find();
    const mAccount = mainAccounts[0];
    const mainUpdatedBalance = mAccount.balance + mainProfit;
    const updatedMainAccount = await updateMainAccountBalance(
      mAccount?._id.toString(),
      mainUpdatedBalance,
      savedTransections[3]?._id.toString()
    );

    //send money done
    res.status(201).json({
      message: "Cashout Successful.",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Server Error Found.",
    });
  }
};
