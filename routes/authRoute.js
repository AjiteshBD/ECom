const express = require('express');
const routes = express.Router();

const { signin,signup,signout,requireSignin} = require("../controller/authController");

const {userSignupValidator} = require('../validator/signupValidator')

routes.post("/signup",userSignupValidator,signup);
routes.post("/signin",signin);
routes.get("/signout",signout);



module.exports = routes;