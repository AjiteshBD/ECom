const express = require('express');
const routes = express.Router();

const {findUserByID} = require("../controller/userController.js");
const { requireSignin,isAuth,isAdmin} = require("../controller/authController");

routes.get("/secret/:userId",requireSignin,isAuth,isAdmin,(req,res)=>{
    res.json({
        user:req.profile
    })
})

routes.param('userId',findUserByID);



module.exports = routes;