import { Router } from "express";
import * as authController from "../controller/auth/auth.controller";
import { authGard } from "../middlewares/authGard";
import {
  ADMIN_USER_TYPE,
  AGENT_USER_TYPE,
  CUSTOMER_USER_TYPE,
} from "../models/user.model";
import {
  validateLoginInfo,
  validateRegisterInfo,
} from "./../validator/auth.validator";

export const router = Router();

router.post(
  "/signup-admin",
  validateRegisterInfo,
  authController.verifyAdmin,
  authController.signupUser
);
router.post(
  "/signup-agent",
  validateRegisterInfo,
  authGard([ADMIN_USER_TYPE]),
  authController.verifyAgent,
  authController.signupUser
);
router.post("/signup", validateRegisterInfo, authController.signupUser);
router.post("/login", validateLoginInfo, authController.loginUser);
router.post(
  "/verify-request",
  authGard([CUSTOMER_USER_TYPE, AGENT_USER_TYPE, ADMIN_USER_TYPE]),
  authController.sentVerifyRequest
);
router.post("/verify/:token", authController.verifyEmail);
router.put(
  "/reset-password",
  authGard([CUSTOMER_USER_TYPE, AGENT_USER_TYPE, ADMIN_USER_TYPE]),
  authController.resetPassword
);
router.put("/forget-password", authController.forgetPassword);
router.put("/set-new-password", authController.resetPasswordByVerifyCode);
