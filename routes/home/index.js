const { Router } = require("express");
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
router.get("/", (req, res) => {
  res.send("welcome home");
});

router.get("/register", (req, res) => {
  res.render("home/register");
});

router.post("/register", (req, res) => {
  const {
    name,
    email,
    password,
    sex,
    phoneNumber,
    location,
    reason,
  } = req.body;
  const newUser = new User({
    name,
    email,
    password,
    sex,
    phoneNumber,
    location,
    reason,
    // isAdmin:1
    //will uncomment this if I want a user to be an admin
  });
  newUser.save()
  .then(savedUser=>{
    //   console.log(savedUser)
      //will change the redirection later
      res.redirect('/')
  })

});
module.exports = router;
