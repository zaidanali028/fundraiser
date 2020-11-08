const { Router } = require("express");
const express = require("express");
const router = express.Router();
const User = require("../../models/User");
const path = require("path");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const sgMail = require("@sendgrid/mail");
const async = require("async");
const crypto = require("crypto");
const key = process.env.SENDGRID_API_KEY;
const axios = require("axios");

//SMS CONFIG
let recipient = ""; //International format (233) excluding the (+)
const sender = "SFTNA"; //11 Characters maximum
let SMSmsg = "";
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
  const ghPhoneNum = "233" + phoneNumber;
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
  } else {
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
        isAdmin:1
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
            Thank You Very Much @${savedUser.name} For Joining SmileForTheNeedAid Foundation\n.
We Hope To Do More For The Needy,Together With You,With Your Loyal Support,This Wonderful Initiative\n
 Will Thrive And Will Continue To Exist.\nYou Can Login With Your
 Credentials As Our Pateron And Modify Any Mistakes You Did During Registeration.\nThank You Once Again For 
 Joining The Family Cheese! #SmileForTheNeedAid™.\n\nAll Rights Reserved ©2020.
             
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
                    `You Have Successfully Registered as ${savedUser.name} And Can Login.Check Your Email For Confirmation`
                  );
                  res.redirect("/login");
                })
                .catch((error) => {
                  console.error(error);
                });
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

router.post("/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/admin/user",
    successFlash: true,
    failureRedirect: "/login",
    failureFlash: true,
  })(req, res, next);
});
//Reset Password route(GET)
router.get("/reset", (req, res) => {
  res.render("home/reset");
});
//Sending a reset password req,from client
router.post("/reset", function (req, res, next) {
  async.waterfall(
    [
      function (done) {
        crypto.randomBytes(20, function (err, buf) {
          var token = buf.toString("hex");
          done(err, token);
        });
      },
      function (token, done) {
        User.findOne({ email: req.body.email }, function (err, user) {
          if (!user) {
            req.flash("error_msg", "No account with that email address exists.");
            return res.redirect("/reset");
          }
          //creating or overwritin on the user schema's  resetPasswordToken property
          user.resetPasswordToken = token;
          user.resetPasswordExpires = Date.now() + 1800000; // 30 Minutes

          user.save(function (err) {
            done(err, token, user);
          });
        });
      },
      function (token, user, done) {
        SMSmsg=   
                
               `You are receiving this SMS from us because you (or someone else) have requested the reset of the password for your account. Please click on the following link, or paste this into your browser to complete the process. If you did not request this, please ignore this SMS and your password will remain unchanged.This link is only valid 30 minutes from now and will be void after 30 minutes.RESET PASSWORDLINK==> http://${req.headers.host}/reset/${token} Regards,SmileForTheNeedAid`
        // encoding the message
        const messageEncode = encodeURI(SMSmsg);
        const senderEncode = encodeURI(sender);
        recipient=user.phoneNumber

        //preparing url
        const url = `https://sms.textcus.com/api/send?apikey=${smsApiKey}&destination=${recipient}&source=${senderEncode}&message=${messageEncode}`;
        //Using axios to send a get request
        axios.get(url).then((resp) => {
        res.redirect("/reset");
        req.flash('success_msg','A reset password link has been sent to your phone number,check your SMS!')
       // console.log(resp);
      }).catch(error=>console.log(error))
        
      },
    ],
   
  );
});

//If the user taps on the reset password link
router.get('/reset/:token', function(req, res) {
  User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
    if (!user) {
      req.flash('error_msg', 'Password reset link is invalid or has expired.');
      return res.redirect('/reset');
    }
    res.render('home/resetsuccess', {user:user.resetPasswordToken});
  });
 
});
router.post('/reset/:token', function(req, res) {
  const {passwordConfirm}=req.body
  const {password}=req.body
  let errors=[]
  if(password!=passwordConfirm ||password.length<=10 ){
    errors.push({msg:'Password Did Not Mach or Your password digits is equalto or lessthan 10,Please Try Again'})
    res.render('home/resetsuccess',{errors})

  }
  async.waterfall([
    function(done) {
      User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
          req.flash('error_msg', 'Password reset token is invalid or has expired.');
          return res.redirect('/reset');
        }
        bcrypt.genSalt(10, (err, salt) =>
        bcrypt.hash(password, salt, (err, hash) => {
          if (err) {
            console.log(err);
          }  else {
            user.password = hash;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined
            user.save().then((savedUser) => {
              req.flash(
                "success_msg",
                "Password Was Successfully Changed,Try Loggin in!"
              );
              res.redirect("/login");
            }).catch(err=>console.log(err))
            
          }
        })
      )
      });
    },
   
  ], function(err) {
    res.redirect('/reset');
    
  });
});
      


module.exports = router;
