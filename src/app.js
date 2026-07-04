import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
//cookie parser for maipulating cookies in browser which is only accessible by browser

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  }),
);

//below four are configurations for app using express
app.use(express.json({ limit: "16kb" })); //to accept json
app.use(express.urlencoded()); // to accept url querry params
app.use(express.static("Public")); //to save temp files like logo or favicon icon or naam public eslye kyu k humne public naam ka folder banaya hua hai
app.use(cookieParser());

//routes import
import userRouter from "./routes/user.route.js";

//routes declaration
app.use("/api/v1/users", userRouter);

export { app };
