const express = require('express');
const routes = express.Router();

const {create,findCategoryByID,read} = require("../controller/categoryController");
const {requireSignin,isAuth,isAdmin} = require("../controller/authController");
const {findUserByID} = require("../controller/userController.js");

routes.get("/category/:categoryId",read)
routes.post("/category/create/:userId",requireSignin,isAuth,isAdmin,create);


routes.param('userId',findUserByID);
routes.param('categoryId',findCategoryByID);

module.exports = routes;