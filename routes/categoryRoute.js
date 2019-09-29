const express = require('express');
const routes = express.Router(); 

const {create,findCategoryById,read,list,update,remove} = require("../controller/categoryController");
const {requireSignin,isAuth,isAdmin} = require("../controller/authController");
const {findUserByID} = require("../controller/userController.js");

routes.get("/category/:categoryId",read);
routes.get("/categories",list);
routes.post("/category/create/:userId",requireSignin,isAuth,isAdmin,create);
routes.put("/category/:categoryId/:userId",requireSignin,isAuth,isAdmin,update);
routes.put("/category/:categoryId/:userId",requireSignin,isAuth,isAdmin,remove);


routes.param('userId',findUserByID);
routes.param('categoryId',findCategoryById);

module.exports = routes;