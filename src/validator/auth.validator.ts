import { NextFunction, Request, Response } from "express";
import { isEmpty } from "lodash";
import { IUser } from "../models/user.model";

export const validateRegisterInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, birthdate, idNo, phone } =
      req.body as IUser;
    let newError: any = {};
    if (!firstName) {
      newError.firstName = "Please Enter Your First Name.";
    }
    if (!lastName) {
      newError.lastName = "Please Enter Your Last Name.";
    }
    if (!email) {
      newError.email = "Enter Your Email Address.";
    }
    if (!password) {
      newError.password = "Please Enter Your Password.";
    }
    if (!birthdate) {
      newError.birthdate = "Please Choose Your Birthdate.";
    }
    if (!idNo) {
      newError.idNo = "Please Enter Your Id No";
    }
    if (!phone) {
      newError.phone = "Please Enter Your Phone No";
    }

    if (isEmpty(newError)) {
      next();
    } else {
      res.status(200).json({
        message: "Value Not Found.",
        errors: newError,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
      error: err,
    });
  }
};
export const validateLoginInfo = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password, phone } = req.body as IUser;
    let newError: any = {};

    if (!email && !phone) {
      newError.email = "Please Enter Your Email Or Phone Number.";
    }
    if (!password) {
      newError.password = "Please Enter Your Password.";
    }

    if (isEmpty(newError)) {
      next();
    } else {
      res.status(200).json({
        message: "Value Not Found.",
        errors: newError,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
      error: err,
    });
  }
};
