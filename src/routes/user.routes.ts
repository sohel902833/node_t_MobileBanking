import { Router } from "express";
import * as userController from "../controller/user/user.controller";
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
router.post("/send-money", authGard(), userController.sendMoney);
router.post("/payment", authGard(), userController.payment);
router.post("/cashout", authGard(), userController.cashOutToAgent);
router.get("/", authGard(), userController.getUserProfile);
