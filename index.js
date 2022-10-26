const express = require('express');
const req = require('express/lib/request');
const res = require('express/lib/response');
const mongoose = require('mongoose');
const session = require('express-session');
const authRoutes = require('./Routes/authRoutes');
const cookieParser = require('cookie-parser');
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cookieParser());

const AdminModel = require("./Models/admin");

app.use((req, res, next) => {
    const corsWhitelist = ["", "http://localhost:3000"]
    if(corsWhitelist.indexOf(req.headers.origin)!==-1){
      res.header("Access-Control-Allow-Origin", req.headers.origin);
      res.header('Access-Control-Allow-Credentials', true);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,UPDATE,OPTIONS');
      res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
    }
    next();
});
const port =process.env.PORT|| 9000;

const URL = "mongodb://localhost:27017/CurassoAdmin";
mongoose.connect(URL,{ useNewUrlParser: true, useUnifiedTopology: true },()=>{console.log(`Connected to Database ${URL}`)});
app.use(authRoutes);

app.use(
    session({
        secret: "key that will sign cookie",
        resave: false,
        saveUninitialized: false
    })
)

app.get('/read-cookies', (req,res)=>{
    const cookies = req.cookies;
    console.log(cookies.newUser);
    res.json(cookies);
})

app.get('*',(req,res)=>{
    res.send("hello world")
})

app.listen(port, () => {
    console.log(`BE started at port ${port}`);
});