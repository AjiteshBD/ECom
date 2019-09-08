const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

const Product = require("../models/product");
const {errorHandler}=require("../util/dbErrorHandler");

//Find Product BY ProductID
exports.findProductByID = (req,res,next,id)=>{
    Product.findById(id).exec((err,product)=>{
        if(err || !product){
            return res.status(400).json({
                error:"Prodcut not found!"
            })
        }
        req.product = product;
        next();
    })
};

//Create a New Product
exports.create = (req,res)=>{
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req,(err,fields,files)=>{
        if(err){
            return res.status(400).json({
                error:"Image could not be uploaded"
            })
        }
        //check all the mandotory fields

        const{name,description,price,category,quantity,shipping} = fields;
        
        if(!name || !description||!price||!category||!quantity||!shipping)
        {
            return res.status(400).json({
                error :"All fields are mandatory"
            })
        }

        let product = new Product(fields);

        if(files.photo){
            if(files.photo.size >1000000){
                return res.status(400).json({
                    error:"Image should be less than 1 MB"
                })
            }
            product.photo.data= fs.readFileSync(files.photo.path);           
            product.photo.contentType = files.photo.type;
        }

        product.save((err,result)=>{
            if(err){
                console.log(product.name);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            return res.json(result);
        })
    });

};



//Reading the Data and Sending response
exports.read=(req,res)=>{
    req.product.photo =undefined;
    return res.json(req.product);
};

//Delete Product 
exports.remove=(req,res)=>{
    let product = req.product;
    product.remove((err,result)=>{
        if(err){
            return res.status(400).json({
                err:errorHandler(err)
            })
        }
        res.json({            
            message: "Product Deleted SuccessFully!"
        })
    })
};

//Update Product
exports.update=(req,res)=>{
    //Using Formidable Library to Read form data
    let form = new formidable.IncomingForm();
    //Keeping the file extension example(.jpg,png)
    form.keepExtensions = true;
    //parsing the request body
    form.parse(req,(err,fields,files)=>{
        //if condition to handle Error in parsing
        if(err){
            return res.status(400).json({
                error:"Image could not be uploaded"
            })
        }
        //check all the mandotory fields
        const{name,description,price,category,quantity,shipping} = fields;
        
        if(!name || !description||!price||!category||!quantity||!shipping)
        {
            return res.status(400).json({
                error :"All fields are mandatory"
            })
        }

        //updating the product
        let product = req.product;
        //using Loadash library as '_'  to update fields
        product = _.extend(product,fields);

        //Image Handling
        if(files.photo){
            //Image size condition check < 1 MB
            if(files.photo.size >1000000){
                return res.status(400).json({
                    error:"Image should be less than 1 MB"
                })
            }
            
            product.photo.data= fs.readFileSync(files.photo.path);           
            product.photo.contentType = files.photo.type;
        }
        //End Saving the Updated Product into DB
        product.save((err,result)=>{
            if(err){
                console.log(product.name);
                return res.status(400).json({
                    error: errorHandler(err)
                });
            }
            return res.json(result);
        })
    });

};