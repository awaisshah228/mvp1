const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');


// cloudinary.config({
//     cloud_name: "dkkq14s4l",
//     api_key: "237712754911295",
//     api_secret: "sSo1Rn8Cl-IsodYDE9_d7b_bHgs",
//   });

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'some-folder-name',
      format: async (req, file) => 'png', // supports promises as well
      public_id: (req, file) => 'computed-filename-using-request',
    },
  });
   
  const parser = multer({ storage: storage });
  module.exports=parser