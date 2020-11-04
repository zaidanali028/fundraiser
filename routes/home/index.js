const { Router } = require("express");
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const path = require("path");

router.get("/", (req, res) => {
  res.send("welcome home");
});

router.get("/register", (req, res) => {
  res.render("home/register");
});

router.post("/register", (req, res) => {
//  console.log(req.files)
  const {
    name,
    email,
    password,
    sex,
    location,
    reason,
  } = req.body;
  let {phoneNumber}=req.body
  phoneNumber=phoneNumber.substring(1)
  const ghPhoneNum='+233'+phoneNumber
  // console.log(ghPhoneNum)

  
  function isNotEmpty(object) {
    //am  checking if there is a key(uploader) in the object ,and if there is ,we will return true or false otherwise
    for (let key in object) {
      // console.log(key)
      if (object.hasOwnProperty(key)) {
        return true;
      }
    }
    return false;
  }

  let fileName = "";
  //console.log(req.files)
  if (isNotEmpty(req.files)) {
    const fileObject = req.files.uploader;
    fileName = new Date().getSeconds() + "-" + fileObject.name;
    //the new Date().getSeconds+'-'+ is there to prevent duplicate picturename
    fileObject.mv("./public/uploads/" + fileName, (err) => {
      if (err) console.log(err);
      console.log("has something");
    });
  } else {
    console.log("has nothing");
  }



  const newUser = new User({
    name,
    email,
    password,
    uploader:fileName,
    sex,
    phoneNumber:ghPhoneNum,
    location,
    reason,
    //  isAdmin:1
   // will uncomment this if I want a user to be an admin
  });
  newUser.save()
  .then(savedUser=>{
    //   console.log(savedUser)
      //will change the redirection later
      res.redirect('/')
  })

});
module.exports = router;
