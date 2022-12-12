import { Router } from "express";
import * as transectionController from "../controller/transection/transection.controller";
import { authGard } from "../middlewares/authGard";
import {
  ADMIN_USER_TYPE,
  AGENT_USER_TYPE,
  CUSTOMER_USER_TYPE,
} from "../models/user.model";

export const router = Router();
router.get(
  "/",
  authGard([ADMIN_USER_TYPE, CUSTOMER_USER_TYPE, AGENT_USER_TYPE]),
  transectionController.getMyTransections
);
