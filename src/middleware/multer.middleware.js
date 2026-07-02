import multer from "multer";

/*we can also use memory but the problem is if the video is large then 
it will take a lot of memory and can crash the server so we are using diskStorage
to store the files in local storage and then we will upload it to cloudinary and 
then delete the file from local storage */

const storage = multer.diskStorage({
  //using multer diskStorage to store files in local storage
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

export const upload = multer({
  storage,
});
