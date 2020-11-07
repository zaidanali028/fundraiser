const { Router } = require("express");
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const path = require("path");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");

const key =
  "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";

router.get("/", (req, res) => {
  res.send("welcome home");
});

router.get("/register", (req, res) => {
  res.render("home/register");
});

router.post("/register", (req, res) => {
  let errors = [];
  const {
    name,
    email,
    password,
    passwordConfirm,
    sex,
    location,
    reason,
  } = req.body;
  let { phoneNumber } = req.body;
  phoneNumber = phoneNumber.substring(1);
  const ghPhoneNum = "+233" + phoneNumber;
  if (password != passwordConfirm) {
    errors.push({ msg: "Both passwords must be the same!" });
    res.render("home/register", {
      name,
      email,
      password,
      passwordConfirm,
      errors,
      reason,
      location,
      phoneNumber,
    });
  }
  User.findOne({ email: email }).then((user) => {
    if (user) {
      errors.push({ msg: "Email Already registered!" });
      console.log(errors);
      res.render("home/register", {
        name,
        email,
        password,
        passwordConfirm,
        errors,
        reason,
        location,
        phoneNumber,
      });
    }
  });
  if (password.length <= 10) {
    errors.push({ msg: "Password Must Be Strong And Must Exceed 10 Digits " });

    res.render("home/register", {
      name,
      email,
      password,
      passwordConfirm,
      errors,
      reason,
      location,
      phoneNumber,
    });
  }
else{
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
    uploader: fileName,
    sex,
    phoneNumber: ghPhoneNum,
    location,
    reason,
    //  isAdmin:1
    // will uncomment this if I want a user to be an admin
  });
  bcrypt.genSalt(10, (err, salt) =>
    bcrypt.hash(newUser.password, salt, (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        newUser.password = hash;
        newUser
          .save()
          .then((savedUser) => {
            sgMail.setApiKey(key);
            const msg = {
              to: savedUser.email, // Change to your recipient
              from: "developersavenue@gmail.com", // Change to your verified sender
              subject: "SmileForTheNeedaid Success Registeration Message",
              text: `
            Thank You Very Much @${savedUser.name} For Joining SmileForTheNeedAid Foundation.
We Hope To Do More For The Needy,Together With You,With Your Loyal Support,This Wonderful Initiative
 Will Thrive And Will Continue To Exist.You Can Login With Your
 Credentials As Our Pateron And Modify Any Mistakes You Did During Registeration.Thank You Once Again For 
 Joining The Family Cheese! #SmileForTheNeedAid™.All Rights Reserved ©2020.
             
              YOUR NAME: ${savedUser.name}
              YOUR EMAIL: ${savedUser.email}
              YOUR PHONEno.: ${savedUser.phoneNumber}
              YOUR LOCATION: ${savedUser.location}`, // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
            };
            sgMail
              .send(msg)
              .then(() => {
                console.log("Email sent");
                req.flash(
                  "success_msg",
                  `You Have Successfully Rgistered as <strong>${savedUser.name}</strong> And Can Login.Check Your Email For Confirmation`
                );
                res.redirect("/login");
              })
              .catch((error) => {
                console.error(error);
              });

            // req.flash(
            //   "success_msg",
            //   "You have successfully registered and can now login"
            // );
            // res.redirect("/login");
          })
          .catch((err) => console.log(err));
      }
    })
  );
  }
});

router.get("/login", (req, res) => {
  res.render("home/login");
});

router.post("/login", (req, res) => {
  res.send("logged in........");
});
module.exports = router;
