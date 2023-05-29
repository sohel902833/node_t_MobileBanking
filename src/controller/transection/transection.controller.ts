import { NextFunction, Response } from "express";
import MainAccount from "../../models/mainaccount.model";
import { USER_MODEL_NAME } from "../../models/modelConfig";
import Transection from "../../models/transection.model";
import { IRequest } from "../../types/express";
import { userPublicValue } from "../user/userConfig";

export const getMyTransections = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId;
    const transections = await Transection.find({ user: userId }).populate(
      "user",
      userPublicValue
    );
    res.status(201).json({
      transections,
    });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const getUserTransections = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const transections = await Transection.find({ user: userId }).populate(
      "user",
      userPublicValue
    );
    res.status(201).json({
      transections,
    });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const getMainAccountTransections = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const transections = await MainAccount.find().populate({
      path: "transections.transection",
      populate: [
        {
          path: "senderUser",
          model: USER_MODEL_NAME,
          select: userPublicValue,
        },
        {
          path: "receiverUser",
          model: USER_MODEL_NAME,
          select: userPublicValue,
        },
      ],
    });

    if (transections && transections.length > 0) {
      const tr = transections[0];
      res.status(201).json({
        balance: tr.balance,
        transections: tr.transections.reverse(),
      });
    } else {
      res.status(200).json({
        message: "transections not found",
      });
    }
  } catch (err) {
    console.log(err);
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
