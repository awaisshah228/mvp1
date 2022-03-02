const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  walletAddress: {
    type: String,
    required: true
  },
  nonce: {
    type: Number,
    default: Math.floor(Math.random() * 10000),
  },
  userName: {
    type: String,
    required: true,
  },
  role:{
    type: String
  },
  bio:{
    type: String
  },
  email:{
      type: String
  },
  socialLinks:[
      {
          type: String
      }
  ],
  following:[
    {type: mongoose.Types.ObjectId, ref: 'user'}
  ],
  profilePic:{
    type: String,
    default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
  },
  banner:{
    type: String,
    default: 'https://res.cloudinary.com/devatchannel/image/upload/v1602752402/avatar/avatar_cugq40.png'
  },
  savedPost: [{type: mongoose.Types.ObjectId, ref: 'post'}],

  
},{
    timestamps: true
});

module.exports =  mongoose.model("user", UserSchema);