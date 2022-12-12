import { sign } from "jsonwebtoken";
export const getSignedToken = (userId: string): string => {
  const token = sign({ userId }, process.env.USER_JWT_SECRET as string, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  return token;
};

export const getVerifyMailToken = (userId: string): string => {
  const token = sign({ userId }, process.env.VERIFY_EMAIL_SECRET as string, {
    expiresIn: process.env.VERIFY_EMAIL_EXPIRY_TIME,
  });
  return token;
};
