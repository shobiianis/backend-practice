import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Database connected and server is on");
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed on server", err);
  });
