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

/** 
 * sell /arrival 
 * by sell  = /products?sortBy=sold&order=desc&limit=4
 * by arrival = /products?sortBy=createdAt&order=desc&limit=4
 * if no params send , then all products will be returned
*/

exports.list = (req,res)=>{
    let order = req.query.order ? req.query.order : 'asc'
    let sortBy = req.query.sortBy ? req.query.sortBy : '_id'
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find()
    .select("-photo")
    .populate('category')
    .sort([[sortBy,order]])
    .limit(limit)
    .exec((err,products)=>{
        if(err){
            //console.log(err);
            res.status(400).json({
                error :"Products not found"
            })
        }
        res.send(products)
    })


};

// it will find the related products based on requested product category
// other products with the same category will be returned

exports.listRelated =(req,res)=>{
    let limit = req.query.limit ? parseInt(req.query.limit) : 6

    Product.find({_id:{$ne: req.product},category:req.product.category}).limit(limit).populate('category','_id name')
    .exec((err,products)=>{
        if(err){
            res.status(400).json({
                error : "Products not found"
            })
        }
        res.json(products);
    })
};



exports.listCategories = (req,res)=>{
    Product.distinct("category",{},(err,categories)=>{
        if(err){
            res.status(400).json({
                error : "Category not found"
            })
        }
        res.json(categories);
    })
};

/**
 * list products by search
 * we will implement product search in react frontend
 * we will show categories in checkbox and price range in radio buttons
 * as the user clicks on those checkbox and radio buttons
 * we will make api request and show the products to users based on what he wants
 */
 
exports.listBySearch = (req, res) => {
    let order = req.body.order ? req.body.order : "desc";
    let sortBy = req.body.sortBy ? req.body.sortBy : "_id";
    let limit = req.body.limit ? parseInt(req.body.limit) : 100;
    let skip = parseInt(req.body.skip);
    let findArgs = {};
 
    // console.log(order, sortBy, limit, skip, req.body.filters);
    // console.log("findArgs", findArgs);
 
    for (let key in req.body.filters) {
        if (req.body.filters[key].length > 0) {
            if (key === "price") {
                // gte -  greater than price [0-10]
                // lte - less than
                findArgs[key] = {
                    $gte: req.body.filters[key][0],
                    $lte: req.body.filters[key][1]
                };
            } else {
                findArgs[key] = req.body.filters[key];
            }
        }
    }
 
    Product.find(findArgs)
        .select("-photo")
        .populate("category")
        .sort([[sortBy, order]])
        .skip(skip)
        .limit(limit)
        .exec((err, data) => {
            if (err) {
                return res.status(400).json({
                    error: "Products not found"
                });
            }
            res.json({
                size: data.length,
                data
            });
        });
};



exports.photo = (req,res,next)=>{
    if(req.product.photo.data){
        res.set('Content-Type',req.product.photo.contentType)
        return res.send(req.product.photo.data)
    }
    next();
};