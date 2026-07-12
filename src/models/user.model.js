import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowecase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, // cloudinary url
      required: true,
    },
    coverImage: {
      type: String, // cloudinary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

// pre hook from mongoose helps k data just save hone se phle kuch karde jese password ko encrypt karde
//"save" is like jab data database me save horaha ho ese or bhi hain jese "validate", "updateOne" etc
//Use karte waqt this. se hoga
// next flag eslye kyu k ye ik middleware ka kaam hai as you can see mongoose --->middleware-->pre

userSchema.pre("save", async function (next) {
  /* ab masla ye hai k agar koi bhi field change hogi to password bycrypt hoga jab k hume chaye
  k jab password change ho ya first time dale to password becryopt kare eslye ik condition 
  lagayi hai k agar password change nae hua to next karde otherwise bycrypt kare */

  if (!this.isModified("password")) return;
  // next();

  this.password = await bcrypt.hash(this.password, 10);
  // next();
});

/*  ab agar password database se check hoga to woh to ik encrypted format me hoga to usko match karne k lye
dobara decrypt kar k compare karna parega to us k lye
ye jo isPasswordCorrect hai woh ik custom user defined function banaya hai with the help of
mongoose method. Mongoose method se hum koi bhi apna function bana sakte hain */

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

export const User = mongoose.model("User", userSchema);
