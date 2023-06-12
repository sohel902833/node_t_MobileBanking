import { Router } from "express";
import { pushSettingsToReq } from "../controller/admin/settings.controller";
import * as userController from "../controller/user/user.controller";
import * as userTransectionController from "../controller/user/userTransection.controller";
import { authGard } from "../middlewares/authGard";
import {
  ADMIN_USER_TYPE,
  AGENT_USER_TYPE,
  CUSTOMER_USER_TYPE,
} from "../models/user.model";

export const router = Router();
router.get(
  "/",
  authGard([CUSTOMER_USER_TYPE, ADMIN_USER_TYPE, AGENT_USER_TYPE]),
  userController.getUserProfile
);
router.post(
  "/validate-send-money",
  authGard(),
  userTransectionController.validateUserToUserSendMoneyRequest
);
router.post(
  "/send-money/:token",
  authGard(),
  userTransectionController.sendMoney
);
router.post("/payment", authGard(), userController.payment);
router.post(
  "/cashout",
  authGard(),
  pushSettingsToReq,
  userTransectionController.cashOutToAgent
);
router.get("/", authGard(), userController.getUserProfile);
