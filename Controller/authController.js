const Admin = require('../Models/admin');
const jwt = require('jsonwebtoken');

const maxAge = 1*24*60*60;
const createToken = (id)=>{
    return jwt.sign({id},'@#$%',{
        expiresIn: maxAge
    })
}

module.exports.signup_post = async (req, res) => {
    const {name, number, email, password} = req.body;
    
    try {
        const num = await Admin.findOne({number});
        if(num){
            const errors = handleErrors({message : "Number Registered"});
            res.status(400).json({ errors });
        }
        else{
            const admin = await Admin.create({name,email,number,password,date:new Date()});
            const token = createToken(admin._id);
            console.log(token);
            res.cookie('jwtoken', token, { httpOnly: true, maxAge: maxAge * 1000 });
            // res.status(201).json({ admin: admin._id,token,admindata:admin });
            res.status(201).json({ admin: admin._id,token});
        }
    }
    catch(err) {
        const errors = handleErrors(err);
        res.status(400).json({ errors });
    }
}

module.exports.login_post = async (req, res) => {
    const { email,password } = req.body;
  
    try {
      const admin = await Admin.login(email,password);
      const token =  createToken(admin._id);
      console.log(token);
      //   res.status(200).json({ admin: admin._id ,token,admindata:admin});
      res.status(200).json({ admin: admin._id ,token});
      console.log(admin);
    } 
    catch (err) {
      const errors = handleErrors(err);
      res.status(400).json({ errors });
    }
    
}

module.exports.logout_get = (req, res) => {
    res.cookie('jwtoken', '', { maxAge: 1});
    res.redirect('/');
}