const {Router} = require('express');
const router = Router();
const authController = require('../Controller/authController');
const jwt = require('jsonwebtoken');
const Admin = require('../Models/admin');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const transporter = nodemailer.createTransport(sendgridTransport({
    auth:{
        api_key: process.env.SENDGRID_API
    }
}))

router.post('/signup', authController.signup_post);
router.post('/login',authController.login_post);
router.get('/logout', authController.logout_get);

router.post('/reset-password',(req,res)=>{
    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            console.log(err)
        }
        const token = buffer.toString("hex")
        Admin.findOne({email:req.body.email})
        .then(admin=>{
            if(!admin){
                return res.status(422).json({error:"User dont exists with that email"})
            }
            admin.resetToken = token
            admin.expireToken = Date.now() + 3600000
            admin.save().then((result)=>{
                transporter.sendMail({
                    to:admin.email,
                    from:"no-replay@curasso.com",
                    subject:"password reset",
                    html:`
                    <p>You requested for password reset</p>
                    <h5>click in this <a href="${process.env.EMAIL}/reset/${token}">link</a> to reset password</h5>
                    `
                })
                res.json({message:"check your email"})
            })

        })
    })
})


router.post('/new-password',(req,res)=>{
   const newPassword = req.body.password
   const sentToken = req.body.token
   Admin.findOne({resetToken:sentToken,expireToken:{$gt:Date.now()}})
   .then(admin=>{
       if(!admin){
           return res.status(422).json({error:"Try again session expired"})
       }
       bcrypt.hash(newPassword,12).then(hashedpassword=>{
          admin.password = hashedpassword
          admin.resetToken = undefined
          admin.expireToken = undefined
          admin.save().then((saved)=>{
              res.json({message:"password updated success"})
          })
       })
   }).catch(err=>{
       console.log(err)
   })
})

module.exports = router;