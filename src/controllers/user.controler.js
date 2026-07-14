import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndRefereshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating referesh and access token",
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // req.body
  // res.status(200).json({
  //   data: {
  //     key: "value",
  //   },
  //   message: "any message",
  // });

  // get user details from frontend
  // validation - not empty
  // check if user already exists: username, email
  // check for images, check for avatar
  // upload them to cloudinary, avatar
  // create user object - create entry in db
  // remove password and refresh token field from response
  // check for user creation
  // return res

  const { fullName, email, username, password } = req.body;

  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists");
  }
  /*
  req.files eslye kyu k humne multer middleware use kia hai to ye req.files provide karta hai
  jisme se hum avatar aur coverImage ka path nikal rahe hain 
  */
  const avatarLocalPath = req.files?.avatar?.[0]?.path;
  const coverImageLocalPath = req.files?.coverImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Avatar from cloudinary is required");
  }

  // yahan validation k baad ik user create horaha hai
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });

  /*  ab question is how can User can find the user so the answer is k ye USer jo schema model
    se aya hai us k pass poora database
    .select ye karta hai k by default all fields selected hoti hain 
    but - password -refreshToken ye dono fields ko select nahi karega
    */
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // req body --> data extract
  //username or email, password
  //validation
  //check if user exists
  //compare password
  //generate access token and refresh token
  //return response in cookies and data

  const { username, email, password } = req.body;

  if (!username || !email) {
    throw new ApiError(400, "Username or email is required");
  }
  if (!password) {
    throw new ApiError(400, "Password is required");
  }

  /*this below function will check that the provided username or email exists in the database or not.
   If it exists, it will return the user object, otherwise it will return null.*/

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  /*
  ye jo isPasswordCorrect hai ye custom method hai jo humne user.model.js me banaya hai 
  or ye hum user me eslye use kar parahe hain kyu k jab humne findOne se user nikala to isme sari schema/model ki
  functionality jayengi 
  */
  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  /*
  ab hume pata chal gaya k user exists karta hai or password bhi match ho gaya ab hume access token or refresh token generate karna hai
  or usko database me save karna hai ta k pata chale k logged in hogaya hai user
  */
  //  ------------------
  /* ab hum ik custom method banakar bhi kar sakte hain generateAccessAndRefreshToken k naam se
      const { accessToken, refreshToken } = await generateAccessAndRefereshTokens(
      user._id,
      );
      ese bhi kar sakte hain magar humne direct karlia 
  */
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  /*
  humne cookies me set eslye kia hai kyu k ta k server bhi read kar sake or data me eslye bheja
  ta k client bhi usse kaam le sake
  */
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In Successfully",
      ),
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  console.log("🚀 ~ req:", req.user);
  // findByIdAndUpdate eslye kyu k isme hume validation wali key nae deni parti direct find kar k update akrdeta hai
  // new key eslye ta k updated user return kare otherwise old user return karega
  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      returnDocument: "after",
    },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"));
});
export { registerUser, loginUser, logoutUser };
