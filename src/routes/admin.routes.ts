import { Router } from "express";
import * as adminController from "../controller/admin/admin.controller";
import * as adminTransectionController from "../controller/admin/adminTransections.controller";
import * as settingsController from "../controller/admin/settings.controller";
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
  "/clear-balance",
  authGard([ADMIN_USER_TYPE]),
  adminController.clearBalances
);
router.post(
  "/add-balance/agent",
  authGard([ADMIN_USER_TYPE]),
  adminController.pushMainAccount,
  adminTransectionController.sendBalanceToAgent
);
router.post(
  "/add-balance/user",
  authGard([ADMIN_USER_TYPE]),
  adminController.pushMainAccount,
  adminTransectionController.sendBalanceToUserAccount
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
  "/dashboard-info",
  authGard([ADMIN_USER_TYPE]),
  adminController.getDashboardInfo
);
router.get(
  "/users-transection/:userId",
  authGard([ADMIN_USER_TYPE]),
  transectionController.getUserTransections
);
router.get(
  "/users-total-transection/:userId",
  authGard([ADMIN_USER_TYPE]),
  adminController.getUserTotalTransections
);
router.put(
  "/settings",
  authGard([ADMIN_USER_TYPE]),
  settingsController.validateSettingsInfo,
  settingsController.updateSettingsInfo
);
router.get(
  "/settings",
  authGard([ADMIN_USER_TYPE]),
  settingsController.getSettingsInfo
);
router.get("/", authGard([ADMIN_USER_TYPE]), userController.getUserProfile);

router.get(
  "/user-registration/:userType",
  authGard([ADMIN_USER_TYPE]),
  adminController.getUserRegistrationChartInfo
);
