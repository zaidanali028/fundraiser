const User = require("../../models/User");
const Payment = require("../../models/Payment");
const { Router } = require("express");
const express = require("express");
const router = express.Router();
const sgMail = require("@sendgrid/mail");
const Announcements = require("../../models/Announce");
const Questionaire = require("../../models/Questionaire");
const key = "SENDGRID_API_KEY";

router.get("/", (req, res) => {
  let novemberData=''
  const Currentmonth=new Date().getMonth()+1
  Payment.find({})
  .then(payments=>{
    payments.forEach(payment=>{
      const dbMonth=new Date(payment.createdAt).getMonth()+1
      if(Currentmonth===11&&Currentmonth===dbMonth){
       novemberData=Payment.countDocuments({})
        console.log(novemberData)
      }
      res.render('admin/index',{novemberData})
    })
  })
});

router.get("/payments", async (req, res) => {
  let totalForMonth = 0;
  let totalForYear = 0;

  const currentMonth = new Date().getMonth() + 1; // Get current month
  const currentYear = new Date().getFullYear(); // Get current year
  //console.log(currentYear)

  // get all payments from the database
  const allPayments = await Payment.find({});

  for (const singlePayment of allPayments) {
    let currentM = new Date(singlePayment.createdAt).getMonth() + 1;
    let currentY = new Date(singlePayment.createdAt).getFullYear();

    if (currentM === currentMonth && currentY === currentYear) {
      totalForMonth += parseFloat(singlePayment.amount);
    }
    //Getting yearly total
    if (currentY === currentYear) {
      totalForYear += parseInt(singlePayment.amount);
    }
  }

  await User.find({})
    .populate("payment")
    .then((users) => {
      Payment.find({}).then((allPAyments) => {
        let paymentArray = [];

        allPAyments.forEach((payment) => {
          paymentArray.push(payment.amount);
        });
        //initially,total will be 0 and amount will be the frst value in the array
        //then the second loop will have the first value in the array as total ,then
        //add the second value to the first on,till the length of the array exhausts
        const sum = paymentArray.reduce(function (total, amount) {
          return total + amount;
        });
        // console.log(sum)
        // console.log(paymentArray)

        res.render("admin/payment", {
          users,
          sum,
          totalForMonth,
          totalForYear,
        });
      });
    });
});

router.get("/print", (req, res) => {
  let totalForMonth = 0;
  let totalForYear = 0;
  const currentMonth = new Date().getMonth() + 1; // Get current month
  const currentYear = new Date().getFullYear(); // Get current year
  //console.log(currentYear)

  // get all payments from the database
  Payment.find({}).then((payment) => {
    payment.forEach((pay) => {
      // console.log(pay.amount);
      let currentM = new Date(pay.createdAt).getMonth() + 1;
      let currentY = new Date(pay.createdAt).getFullYear();

      if (currentM === currentMonth && currentY === currentYear) {
        totalForMonth += parseFloat(pay.amount);
      }

      //Getting yearly total
      if (currentY === currentYear) {
        totalForYear += parseInt(pay.amount);
      }
    });
  });

  User.find({})
    .populate("payment")
    .then((users) => {
      // console.log(users)
      Payment.find({}).then((allPAyments) => {
        let paymentArray = [];

        allPAyments.forEach((payment) => {
          paymentArray.push(payment.amount);
        });
        //initially,total will be 0 and amount will be the frst value in the array
        //then the second loop will have the first value in the array as total ,then
        //add the second value to the first on,till the length of the array exhausts
        const sum = paymentArray.reduce(function (total, amount) {
          return total + amount;
        });
        // console.log(sum)
        // console.log(paymentArray)

        res.render("admin/print", { users, sum, totalForMonth, totalForYear });
      });
    });
});

//making payment
router.get("/newpayment", (req, res) => {
  User.find({}).then((users) => {
    res.render("admin/newpayment", { users });
  });
});

router.post("/pateron/pay/", (req, res) => {
  // res.send('success')
  const id = req.body.members;
  const { amount } = req.body;
  // console.log(amount);
  User.findById(id).then((user) => {
    const newPay = new Payment({
      amount: amount,
      userId: user._id,
    });
    user.payment.push(newPay);
    user.save().then((savedpayment) => {
      newPay.save().then((payment) => {
        res.redirect("/admin/payments");
      });
    });
  });
});

router.get("/edit/payment/:id", (req, res) => {
  const amountId = req.params.id;
  Payment.findOne({ _id: amountId }).then((payment) => {
    res.render("admin/editpayment", { payment });
  });
});
router.post("/edit/payment/:id", (req, res) => {
  const amountId = req.params.id;
  const newAmount = req.body.amount;
  console.log(newAmount);
  //     Payment.findOne({_id:amountId}).then(payment=>{
  //         payment.amount=newAmount
  //    res.redirect('/admin/payments')
  Payment.findByIdAndUpdate(
    { _id: amountId },
    {
      $set: {
        amount: newAmount,
      },
    }
  ).then((updatedPayment) => {
    res.redirect("/admin/payments");
  });
});

//deleting payment route
router.delete("/deletepayment/:id", (req, res) => {
  // res.send('deleted')
  const { id } = req.params;
  Payment.findOneAndDelete({ _id: id }).then((payment) => {
    payment.remove();
    res.redirect("/admin/payments");
  });
});

//Delete User
router.delete("/delete/user/:id", (req, res) => {
  const userId = req.params.id;
  User.findByIdAndDelete({ _id: userId }).then((user) => {
    user.remove();
    res.redirect("/admin/payments");
  });
});

//Delete User with payments
router.delete("/delete/user/all/:id", (req, res) => {
  //res.send('wwwooow')
  const userId = req.params.id;
  User.findOne({ _id: userId })
    .populate("payment")
    .then((user) => {
      //  console.log(user.payment)

      for (payment of user.payment) {
        Payment.findByIdAndDelete(payment._id).then((payment) => {
          payment.remove();
        });
      }
      user.remove();
      res.redirect("/admin/payments");
    });
});

//Delete User's payments
router.delete("/clear/user/all/:id", (req, res) => {
  //res.send('wwwooow')
  const userId = req.params.id;
  User.findOne({ _id: userId })
    .populate("payment")
    .then((user) => {
      //  console.log(user.payment)

      for (payment of user.payment) {
        Payment.findByIdAndDelete(payment._id).then((payment) => {
          payment.remove();
        });
      }
      res.redirect("/admin/payments");
    });
});
router.get("/interact", (req, res) => {
  User.find({}).then((users) => {
    res.render("admin/interact", { users });
  });
});

router.get("/user/email/:id", (req, res) => {
  const userId = req.params.id;
  User.find({}).then((users) => {
    User.findOne({ _id: userId })
      .then((aUser) => {
        res.render("admin/interact-form", { users, aUser });
      })
      .catch((err) => console.log(err));
  });
});

router.post("/user/email/:id", (req, res) => {
  const userId = req.params.id;
  const { subject } = req.body;
  const { message } = req.body;
  User.findById(userId).then((user) => {
    sgMail.setApiKey(key);
    const msg = {
      to: user.email, // Change to your recipient
      from: "developersavenue@gmail.com", // Change to your verified sender
      subject: subject,
      text: message, // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    };
    sgMail
      .send(msg)
      .then(() => {
        console.log("Email sent");
        res.redirect("/admin/interact");
      })
      .catch((error) => {
        console.error(error);
      });
    //res.send("mail")

    // console.log(user)
  });
});

router.get("/users/email", (req, res) => {
  User.find({}).then((users) => {
    User.count({}).then((userCount) => {
      res.render("admin/mailall", { users, userCount });
    });
  });
});

router.post("/users/email", (req, res) => {
  const { subject, message } = req.body;
  User.find({}).then((allUsers) => {
    allUsers.forEach((user) => {
      sgMail.setApiKey(key);
      const msg = {
        to: user.email, // Change to your recipient
        from: "developersavenue@gmail.com", // Change to your verified sender
        subject: subject,
        text: message, // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };
      sgMail
        .send(msg)
        .then(() => {
          console.log("Email sent to all members");
          res.redirect("/admin/users/email");
        })
        .catch((error) => {
          console.error(error);
        });
    });
  });
  //console.log(subject,message)
});

router.get("/users/announce/", (req, res) => {
  User.find({}).then((users) => {
    Announcements.find({}).then((allAnnouncements) => {
      res.render("admin/announce", { users, allAnnouncements });
    });
  });
});
router.post("/users/announce/", (req, res) => {
  const { message } = req.body;
  const Announce = new Announcements({
    message,
  });
  Announce.save().then((newAnnouncement) => {
    res.redirect("/admin/users/announce");
  });
});
router.get("/edit/announcement/:id", (req, res) => {
  User.find({}).then((users) => {
    Announcements.find({}).then((allAnnouncements) => {
      Announcements.findById(req.params.id).then((foundAnnouncement) => {
        res.render("admin/edit-announce", {
          users,
          allAnnouncements,
          foundAnnouncement,
        });
      });
    });
  });

  //res.send('edit route')
});

router.post("/edit/announcement/:id", (req, res) => {
  // res.send('working')
  const announcementId = req.params.id;
  const msgUpdate = req.body.message;
  Announcements.findOneAndUpdate(
    { _id: announcementId },
    {
      $set: {
        message: msgUpdate,
      },
    }
  ).then((updatedMsg) => {
    res.redirect("/admin/users/announce");
  });
});

router.delete("/delete/announcement/:id", (req, res) => {
  const announcementId = req.params.id;
  // res.send('delete announcement')
  Announcements.findByIdAndDelete({ _id: announcementId }).then(
    (announcement) => {
      announcement.remove();
      res.redirect("/admin/users/announce");
    }
  );
});

router.get("/users/questionaire/", (req, res) => {
  User.find({}).then((users) => {
    Questionaire.find({}).then((allQuestions) => {
      res.render("admin/questionaire", { users, allQuestions });
    });
  });
});

router.post("/users/questionaire/", (req, res) => {
  const { question, answer } = req.body;
  // console.log(question,answer)
  const questAns = new Questionaire({
    question,
    answer,
  });
  questAns.save().then((questAnsSaved) => {
    res.redirect("/admin/users/questionaire");
  });
});
router.get("/edit/questionaire/:id", (req, res) => {
  const questionId = req.params.id;
  User.find({}).then((users) => {
    Questionaire.findById(questionId).then((questionAndAns) => {
      Questionaire.find({}).then((allQuestions) => {
        res.render("admin/edit-questionaire", {
          questionAndAns,
          users,
          allQuestions,
        });
      });
    });
  });
});

//Update Questionaire
router.post("/users/questionaire/:id", (req, res) => {
  const questionId = req.params.id;
  const { question, answer } = req.body;
  // console.log(question,answer)
  Questionaire.findByIdAndUpdate(
    { _id: questionId },
    {
      $set: {
        question,
        answer,
      },
    }
  ).then((updatedQA) => {
    //flash msg here
    res.redirect("/admin/users/questionaire");
  });
  // res.send('workoingfwefrig')
});

router.delete("/delete/questionaire/:id", (req, res) => {
  questionId = req.params.id;
  Questionaire.findByIdAndDelete({ _id: questionId }).then((question) => {
    question.remove();
    res.redirect("/admin/users/questionaire");
  });
});
router.get("/edituser/:id", (req, res) => {
  const userId = req.params.id;
  User.findOne({ _id: userId }).then((user) => {
    res.render("admin/edituser", { user });
  });
});
router.post("/edituser/:id", (req, res) => {
  const {
    name,
    email,
    password,
    sex,
    location,
    reason,
  } = req.body;
  let {phoneNumber}=req.body
  let userId=req.params.id



  
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
    console.log(fileObject)
    fileName = new Date().getSeconds() + "-" + fileObject.name;
    //the new Date().getSeconds+'-'+ is there to prevent duplicate picturename
    fileObject.mv("./public/uploads/" + fileName, (err) => {
      if (err) console.log(err);
      console.log("has something");
    });
  } else {
    console.log("has nothing");
  }
 
  User.findByIdAndUpdate({_id:userId},{$set:{
    name,
    email,
    password,
    sex,
    location,
    reason,
    phoneNumber,
    uploader:fileName
  
  }})
  .then(userUpdate=>{
    res.redirect('/admin/payments')
  
  
  })
})


module.exports = router;
