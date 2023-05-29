import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { connectDb } from "./db";
import { router as adminRouter } from "./routes/admin.routes";
import { router as agentRouter } from "./routes/agent.routes";
import { router as authRouter } from "./routes/auth.routes";
import { router as transectionRouter } from "./routes/transection.routes";
import { router as userRouter } from "./routes/user.routes";

const app = express();
dotenv.config();
connectDb();
//to parse json data
app.use(express.json());
app.use(cors());

app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/admin", adminRouter);
app.use("/transection", transectionRouter);
app.use("/agent", agentRouter);

//routers wil go here

export { app };
