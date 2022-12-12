import { compare, hash } from "bcrypt";
import { NextFunction, Request, Response } from "express";
import { address } from "ip";
import { verify } from "jsonwebtoken";
import { encryptText } from "../../lib/encryption";
import { sendMail } from "../../lib/mailer";
import {
  getPasswordResetCodeTemplate,
  getVerifyMailTemplate,
} from "../../lib/mailTemplate";
import { getRandomNumber } from "../../lib/randomGenerator";
import User, {
  AGENT_USER_TYPE,
  EMAIL_REGISTERED_TYPE,
  IToken,
  IUser,
  PHONE_REGISTEREDE_TYPE,
} from "../../models/user.model";
import VerifyCode, { ICode } from "../../models/verifycode.model";
import {
  getSignedToken,
  getVerifyMailToken,
} from "../../services/auth/auth.service";
import { IRequest } from "../../types/express";
import { ADMIN_USER_TYPE, CUSTOMER_USER_TYPE } from "./../../models/user.model";
export const signupUser = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password, birthdate, phone } = req.body;
    //check email already exists or not
    const prevUser = await User.findOne({ email: email });
    if (prevUser) {
      return res.status(200).json({ message: "User Already Exists." });
    }

    const registeredBy = email ? EMAIL_REGISTERED_TYPE : PHONE_REGISTEREDE_TYPE;
    const userRole = req.userRole ? req.userRole : CUSTOMER_USER_TYPE;
    //hash the password
    const hashedPassword = await hash(password, 10);
    //get an encrypted text based on request ip address
    const deviceId = encryptText(address()).toString();

    const user: IUser = {
      firstName,
      lastName,
      email,
      password: hashedPassword,
      birthdate,
      phone,
      avatar: {
        url: "",
        fileName: "",
      },
      cover: {
        url: "",
        fileName: "",
      },
      verified: userRole === ADMIN_USER_TYPE ? true : false,
      registeredBy,
      tokens: [
        {
          device: deviceId,
          token: "",
        },
      ],
      userType: userRole,
    };

    const newUser = new User(user);
    const createdUser = await newUser.save();
    //generate jwt token
    const token = getSignedToken(createdUser._id.toString());
    let tokenId = "";
    if (createdUser?.tokens && createdUser?.tokens[0]._id) {
      tokenId = createdUser?.tokens[0]?._id.toString();
    }
    const updatedUser = await User.updateOne(
      { _id: createdUser?._id, "tokens._id": tokenId },
      {
        $set: {
          "tokens.$.token": token,
        },
      }
    );

    //delete secure properties from user object to serve
    delete user.password;
    delete user.tokens;
    user.balance = 0;
    res.status(201).json({
      message: "User Register Successful.",
      user,
      token: token,
    });
  } catch (err) {
    return res.status(404).json({
      message: "Server Error Found.",
      error: err,
    });
  }
};
export const loginUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body as IUser;

    const dbUser = await User.findOne({ email: email });
    //check user exists or not
    if (!dbUser) {
      return res.status(200).json({
        message: "User Not Found.",
      });
    }
    //user exists with the email check password now
    const isValidPassword = await compare(
      password as string,
      dbUser?.password as string
    );

    //check password valid or not
    if (!isValidPassword) {
      return res.status(200).json({
        message: "Password Doesn't Matched.",
      });
    }

    //password matched now check previously logged in device
    const reqDeviceId = encryptText(address()).toString();
    let isSameDevice = false;
    let foundPosition = 0;
    dbUser?.tokens?.forEach((token: IToken, index) => {
      if (token.device === reqDeviceId) {
        isSameDevice = true;
        foundPosition = index;
      }
    });
    let tokenId: string = "";
    if (dbUser?.tokens) {
      tokenId = dbUser?.tokens[foundPosition]._id?.toString() as string;
    }
    if (isSameDevice) {
      //generate signed token
      const token = getSignedToken(dbUser._id.toString());
      //update token into database

      const updatedUser = await User.updateOne(
        { _id: dbUser?._id, "tokens._id": tokenId },
        {
          $set: {
            "tokens.$.token": token,
          },
        }
      );
      const user: IUser = {
        firstName: dbUser.firstName,
        lastName: dbUser.lastName,
        email: dbUser.email,
        avatar: dbUser.avatar,
        cover: dbUser.cover,
        birthdate: dbUser.birthdate,
        verified: dbUser.verified,
        phone: dbUser.phone,
        _id: dbUser._id,
        balance: dbUser.balance,
      };
      //populate user

      return res.status(201).json({
        message: "Login Successful.",
        user: user,
        token,
      });
    } else {
      //tried to logged in from another device or another ip
      //generate signed token
      const token = getSignedToken(dbUser._id.toString());
      //put token into database
      const newDevice: IToken = {
        token,
        device: reqDeviceId,
      };
      const updatedUser = await User.updateOne(
        { _id: dbUser?._id, "tokens._id": tokenId },
        {
          $set: {
            "tokens.$.token": token,
            "tokens.$.device": reqDeviceId,
          },
        }
      );

      return res.status(201).json({
        message: "Login Successful.",
        user: dbUser,
        token,
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
      error: err,
    });
  }
};
export const sentVerifyRequest = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.userId as string;
    const token = getVerifyMailToken(userId);

    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(402).json({
        message: "User Not Found.",
      });
    }

    sendMail({
      to: user.email,
      html: getVerifyMailTemplate(
        `${process.env.FRONTEND_EMAIL_VERIFY_URL}/${token}`,
        "Developed By:Md Sohrab Hossain"
      ),
      subject: "<b>Verify Your Account.</b>",
    });

    res.status(201).json({
      message: "Check Your Email To Verify Your Account",
      verifyToken: token,
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
      error: err,
    });
  }
};
export const verifyEmail = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.params.token;
    //check token validity
    const decoded: any = verify(
      token,
      process.env.VERIFY_EMAIL_SECRET as string
    );
    const userId = decoded.userId;

    const user = await User.findOneAndUpdate(
      { _id: userId },
      { verified: true }
    );

    res.status(201).json({
      message: "Email Verified Successful.",
    });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};
export const resetPassword = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { prevPassword, newPassword } = req.body;

    if (!prevPassword || !newPassword) {
      return res.status(200).json({
        message: "Put All Info",
      });
    }

    const userId = req.userId;

    //find user
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({
        message: "User Not Found.",
      });
    }
    //user exists
    //check previous password matched or not
    const isValidPassword = await compare(
      prevPassword as string,
      user?.password as string
    );

    //check password valid or not
    if (!isValidPassword) {
      return res.status(200).json({
        message: "Password Doesn't Matched.",
      });
    }

    //previous password matched
    //generate hashed password with new password

    const hashedPassword = await hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { password: hashedPassword }
    );

    res.status(201).json({
      message: "Password Updated Successful.",
    });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const forgetPassword = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.body.email;

    if (!email) {
      return res.status(200).json({
        message: "Email Not Found.",
      });
    }

    //email is there
    //check user exists with this email or not

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(200).json({
        message: "User Doesn't Exists.",
      });
    }

    //user exists here
    //send 6 digit code to user email and store same info to the database
    const verifyCode = getRandomNumber();
    const newCode: ICode = {
      user: user._id,
      code: verifyCode,
      expiry: new Date().getTime(),
    };

    const prevVerifyCode = await VerifyCode.findOne({ user: user._id });

    //sent verify code to the mail
    sendMail({
      to: user.email,
      html: getPasswordResetCodeTemplate(
        verifyCode,
        "Develop By: Md Sohrab Hossain"
      ),
      subject: "Reset Password",
    });
    if (prevVerifyCode) {
      //need to update into database
      const updatedCode = await VerifyCode.findOneAndUpdate(
        { _id: prevVerifyCode._id },
        newCode
      );

      return res.status(201).json({
        message: "Verify Code Sent To Your Email.",
      });
    } else {
      //need to create to the database
      const newVerifyCode = new VerifyCode(newCode);
      const savedCode = await newVerifyCode.save();
      return res.status(201).json({
        message: "Verify Code Sent To Your Email.",
      });
    }
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found.",
      error: err,
    });
  }
};

export const resetPasswordByVerifyCode = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(200).json({
        message: "Put All Info",
      });
    }

    //check verify code

    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(200).json({
        message: "User Not Found.",
      });
    }

    const verifyCode = await VerifyCode.findOne({ user: user._id });
    if (!verifyCode || verifyCode.code !== Number(code)) {
      return res.status(200).json({
        message: "Verify Code Doesn't Matched.",
      });
    }
    //code matched
    //reset the password
    const hashedPassword = await hash(newPassword, 10);

    const updatedUser = await User.findOneAndUpdate(
      { _id: verifyCode.user },
      { password: hashedPassword }
    );
    //delete verify code from database

    const deletCode = await VerifyCode.deleteMany({ user: user._id });

    res.status(201).json({
      message: "Password Updated Successful.",
    });
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};

export const verifyAdmin = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const secret = process.env.ADMIN_SECRET_KEY;
    const { secret: secretKey } = req.body;
    if (!secretKey || secret !== secretKey) {
      return res.status(200).json({
        message: "Secret Key is required.",
      });
    }

    req.userRole = ADMIN_USER_TYPE;
    next();
  } catch (err) {
    res.status(404).json({
      message: "Session timeout.",
      error: err,
    });
  }
};
export const verifyAgent = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    req.userRole = AGENT_USER_TYPE;
    next();
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
