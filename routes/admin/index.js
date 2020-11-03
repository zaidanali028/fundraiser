const User = require("../../models/User");
const Payment = require("../../models/Payment");
const { Router } = require("express");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/payments", async (req, res) => {
  //Monthly payments
  // let paymentArray1=[]
  // Payment.aggregate([
  //     {
  //         $project:{
  //             month:{$month:"$date"}
  //         }
  //     }
  // ]).then(res=>{
  //     //console.log(res)
  //     res.forEach(response=>{
  //        if(response.month==11){
  //         // console.log(response.month)
  //         Payment.findById(response._id)
  //         .then(payment=>{
  //         //console.log(payment.amount)
  //         paymentArray1.push(payment.amount)
  //         console.log(paymentArray1)
  //         })

  //        }

  //     })

  // })

  let totalForMonth = 0;
   const currentMonth = new Date().getMonth() + 1 // Get current month
   const currentYear  = new Date().getFullYear(); // Get current year

  // get all payments from the database
   const allPayments = await Payment.find({});

  for (const singlePayment of allPayments) {
     let currentM = new Date(singlePayment.createdAt).getMonth() + 1;
     let currentY = new Date(singlePayment.createdAt).getFullYear();

      if (currentM === currentMonth && currentY === currentYear){
        totalForMonth += parseFloat(singlePayment.amount);
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

        res.render("admin/payment", { users, sum, totalForMonth});
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
//Stats route
router.get("/print", (req, res) => {
  User.find({})
    .populate("payment")
    .then((users) => {
      Payment.find({}).then((allPAyments) => {
        let paymentArray = [];

        allPAyments.forEach((payment) => {
          paymentArray.push(payment.amount);
        });

        const sum = paymentArray.reduce(function (total, amount) {
          return total + amount;
        });
        res.render("admin/print", { users, sum });
      });
    });
});
module.exports = router;
