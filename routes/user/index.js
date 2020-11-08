const express=require('express')
const router=express.Router()
const {ensureAuthenticated}=require('../../config/auth')
router.get('/',ensureAuthenticated,(req,res)=>{

    res.render(`user/index`,{
        user:req.user
    })

})





module.exports=router