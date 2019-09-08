const express = require('express');
const routes = express.Router();

const {create,findProductByID,read,remove,update} = require("../controller/productController");
const {requireSignin,isAuth,isAdmin} = require("../controller/authController");
const {findUserByID} = require("../controller/userController.js");

routes.post("/product/create/:userId",requireSignin,isAuth,isAdmin,create);
routes.get("/product/:productId",read);
routes.delete('/product/:productId/:userid',requireSignin,isAuth,isAdmin,remove);
routes.put('/product/:productId/:userid',requireSignin,isAuth,isAdmin,update);

routes.param('userId',findUserByID);
routes.param('productId',findProductByID);

module.exports = routes;