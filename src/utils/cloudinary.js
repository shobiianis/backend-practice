import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

// dotenv.config({
//   path: "./.env",
// });

const uploadOnCloudinary = async (localFilePath) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  if (!localFilePath) return null;

  // if (
  //   !process.env.CLOUDINARY_CLOUD_NAME ||
  //   !process.env.CLOUDINARY_API_KEY ||
  //   !process.env.CLOUDINARY_API_SECRET
  // ) {
  //   console.error(
  //     "Cloudinary credentials are not loaded from environment variables.",
  //   );
  //   return null;
  // }

  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });

    return response;
  } catch (error) {
    console.log("Cloudinary upload failed:", error.message);
    return null;
  }
};

export { uploadOnCloudinary };
