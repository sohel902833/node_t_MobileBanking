import { sign, verify } from "jsonwebtoken";
import {
  SEND_MONEY_TOKEN_EXPIRY,
  SEND_MONEY_VERIFY_SECRET,
} from "../../../secrets";
export const getSendMoneyConfirmToken = (data: any) => {
  const token = sign(data, SEND_MONEY_VERIFY_SECRET as string, {
    expiresIn: `${SEND_MONEY_TOKEN_EXPIRY}s`,
  });
  return token;
};
export const parseSendMoneyConfirmToken = (token: string) => {
  try {
    const decoded: any = verify(
      token,
      process.env.SEND_MONEY_VERIFY_SECRET as string
    );

    return decoded;
  } catch (err) {
    return { error: true };
  }
};
