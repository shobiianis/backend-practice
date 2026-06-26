import mongoose from "mongoose";
import { DB_NAME } from "../constant.js";

const connectDB = async () => {
  try {
    const conncetionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`,
    );
    console.log(
      "MongoDb connection started",
      conncetionInstance.connection.host,
    );
  } catch (error) {
    console.log("Mongodb connection Error", error);
    process.exit(1);
  }
};

export default connectDB;
