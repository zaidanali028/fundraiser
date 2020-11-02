const User = require("../../models/User");
const Payment = require("../../models/Payment");
const { Router } = require("express");
const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("admin/index");
});

router.get("/payments", (req, res) => {
  User.find({})
.populate("payment")
    .then((users) => {
      res.render("admin/payment", { users });
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

router.get('/edit/payment/:id',(req,res)=>{
    const userId=req.params.id
    User.findOne({_id:userId}).then(user=>{
    res.render('admin/editpayment',{user})


    })
})
//Blocker Here
router.post('/edit/payment/:id',(req,res)=>{
    Payment.findByIdAndUpdate
    console.log(req.body)
})

//deleting payment
router.delete('/deletepayment/:id',(req,res)=>{
   // res.send('deleted')
   const {id}=req.params
   Payment.findOneAndDelete({_id:id}).then(payment=>{
       payment.remove()
       res.redirect('/admin/payments')
   })
})
//Stats route
router.get('/stats',(req,res)=>{
    res.send('statistics')
})
module.exports = router;
