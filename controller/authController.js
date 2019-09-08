const User = require('../models/user');
const {errorHandler} = require('../util/dbErrorHandler') ;
const jwt = require('jsonwebtoken');//to generate signed token
const expressJwt = require('express-jwt');//for authorization check


exports.signup=  (req,res)=>{
    const user = new User(req.body);
    user.save((err,user)=>{
        if(err){
            return res.status(400).json({
                Error : errorHandler(err)               
            });
        }
         user.salt = undefined;
         user.cryptpassword = undefined;
        res.json({
            user
        });
    })
};


exports.signin= (req,res)=>{
     //find the user based on email
     const {email,password} = req.body;
     User.findOne({email},(err,user)=>{
         if(err || !user){
             res.status(400).json({
                 Error: "User Email not found. Please SignUp"
             })
         }
         //if user is found make email and password match
         // authenticate method in user model
        if(!user.authenticate(password)){
            return res.status(401).json({
                Error: "Email and Password does not match"
            })
        }
         //generate signed token with user id and secret
         const token = jwt.sign({_id:user._id},process.env.JWT_SECRET);
         //persist token as 't' in cookie with expire date
         res.cookie('t',token,{expire:new Date()+9999})
         //return response with user and token to the front end client
         const {_id,name ,email,role} = user;
         return res.json({token,user:{_id,name,email,role}});

     })
};


exports.signout =(req,res)=>{
        res.clearCookie('t');
        res.status(200).json({
            message : "Signout Successfully"
        })
};



exports.requireSignin = expressJwt({
    secret : process.env.JWT_SECRET,
    userProperty : "auth"
});


exports.isAuth = (req,res,next)=>{
    let user = req.profile && req.auth && req.profile._id == req.auth._id;
    if(!user){
        return res.status(402).json({
            error:"Access Denied"
        })
    }
    next();
};


exports.isAdmin = (req,res,next)=>{
     if(req.profile.role ===0)
     {
        return res.status(403).json({
            error:"Admin resource! Access Denied"
        })
     }

    next();
};

