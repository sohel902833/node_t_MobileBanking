import { Router } from "express";
import * as agentController from "../controller/agent/agent.controller";
import * as userController from "../controller/user/user.controller";
import { authGard } from "../middlewares/authGard";
import { AGENT_USER_TYPE } from "../models/user.model";

export const router = Router();
router.post(
  "/cash-in-user",
  authGard([AGENT_USER_TYPE]),
  agentController.cashInToUserAccount
);
router.get("/", authGard([AGENT_USER_TYPE]), userController.getUserProfile);
