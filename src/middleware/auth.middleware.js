import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    /*
        ye req.cookies eskye kyu k humne cookie parser middleware use kia hai to ye req.cookies provide karta hai or 
        humne jab logged in kia tha to accessToken ko cookies me set karaya tha 
        &
        agar cookies me accessToken nahi hai to hum header se accessToken ko get karenge
        or header se accessToken ko get karne k liye humne authorization header ka use kia hai jisme humne "Bearer " prefix ke sath accessToken milega
        kyu k jwt me bearer token ka use hota hai
    */
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    console.log("🚀 ~ decodedToken:", decodedToken);

    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken",
    );

    if (!user) {
      throw new ApiError(401, "Invalid Access Token");
    }

    /*
        ab jo user hume mila usko hum req.user me set kar denge ta k agle function me req.body jese use hota hai wese hi req.user 
        use hojayega 
    */
    req.user = user;

    // route.post(middlewwar1,middleware2,...middlware(n), controllerFunction)
    // next ka kaam hi yehi k agey passon hona ik middleware se agle middleware me or akhir me controller function me jaye

    next();
  } catch (error) {
    throw new ApiError(401, "Invalid access token");
  }
});
