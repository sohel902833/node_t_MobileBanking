import { Router } from "express";
import * as adminController from "../controller/admin/admin.controller";
import * as transectionController from "../controller/transection/transection.controller";
import * as userController from "../controller/user/user.controller";
import { authGard } from "../middlewares/authGard";
import { ADMIN_USER_TYPE } from "../models/user.model";

export const router = Router();
router.post(
  "/add-balance",
  authGard([ADMIN_USER_TYPE]),
  adminController.addBalanceInMainAccount
);
router.post(
  "/add-balance/agent",
  authGard([ADMIN_USER_TYPE]),
  adminController.pushMainAccount,
  adminController.sendBalanceToAgent
);
router.get(
  "/account",
  authGard([ADMIN_USER_TYPE]),
  adminController.getAdminAccountInfo
);
router.get(
  "/account-transections",
  authGard([ADMIN_USER_TYPE]),
  transectionController.getMainAccountTransections
);

router.get("/users", authGard([ADMIN_USER_TYPE]), userController.getAllUsers);
router.get(
  "/users-transection/:userId",
  authGard([ADMIN_USER_TYPE]),
  transectionController.getUserTransections
);
router.get("/", authGard([ADMIN_USER_TYPE]), userController.getUserProfile);
