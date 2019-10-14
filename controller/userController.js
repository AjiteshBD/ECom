const User = require("../models/user");

exports.findUserByID = (req,res,next,id)=>{
    User.findById(id).exec((err,user)=>{
        if(err || !user){
            return res.status(400).json({
                error:"user not found"
            });
        }
        req.profile = user;
        next();
    });

};

exports.read = (req,res)=>{
    req.profile.salt = undefined;
    req.profile.cryptpassword = undefined;
    return res.send(req.profile);
};


exports.update = (req,res)=>{
    User.findOneAndUpdate({_id:req.profile._id},{$set: req.body},{new:true},(err,user)=>{
        if(err){
            res.status(400).json({
                error : 'You not authorized to perform this action'
            })
        }
        user.salt = undefined;
        user.cryptpassword = undefined;
        res.json(user); 
    })

};