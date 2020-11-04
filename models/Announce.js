const mongoose = require("mongoose");
const announcement = new mongoose.Schema(
  {
    message: {
      type: String,
    },
    date:{
        type:Date,
        default:new Date
    }
  },
  { timestamps: true }
);
const announcementModel = mongoose.model("announcements", announcement);
module.exports = announcementModel;
