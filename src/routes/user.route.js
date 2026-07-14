import { Router } from "express";
import {
  loginUser,
  logoutUser,
  registerUser,
} from "../controllers/user.controler.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();
/*
jab hum post ka keyword use karte hain to woh hume req,res,next provide karta hai
aur phir wohi hum us controller k function k ander use karte hain 
*/

router.route("/register").post(
  /* upload function k ander fields ka use kiya hai 
     jisme hum multiple image fields upload karsakte hain with masx count  1
     */

  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser,
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
