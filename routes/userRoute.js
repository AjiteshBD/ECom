const express = require('express');
const routes = express.Router();

const {findUserByID,read,update} = require("../controller/userController.js");
const { requireSignin,isAuth,isAdmin} = require("../controller/authController");

routes.get("/secret/:userId",requireSignin,isAuth,isAdmin,(req,res)=>{
    res.json({
        user:req.profile
    })
})

routes.get('/user/:userId',requireSignin,isAuth,read)
routes.put('/user/:userId',requireSignin,isAuth,update)

routes.param('userId',findUserByID);

module.exports = routes;