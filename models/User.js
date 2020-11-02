const mongoose = require("mongoose");
const User = new mongoose.Schema(
  {
    payment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "payments",
      },
    ],
    name: {
      type: String,
    },
    email: {
      type: String,
    },
    password: {
      type: String,
    },

    sex: {
      type: String,
    },
    phoneNumber: {
      type: Number,
    },

    location: {
      type: String,
    },
    reason: {
      type: String,
    },
    isAdmin:{
        type:Number,
        default:0
    }
  },
  { timestamps: true }
);
const Usermodel = mongoose.model("users", User);
module.exports = Usermodel;
