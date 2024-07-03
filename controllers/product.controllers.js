import Product from '../models/product.models.js';
import expressAsyncHandler from "express-async-handler";
import cloudinary from 'cloudinary';
import mongoose from 'mongoose';

const uploadImage = async (file) => {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString('base64');
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
  
    const uploadResponse = await cloudinary.v2.uploader.upload(dataURI);
    return uploadResponse.url;
};  

export const addProduct = expressAsyncHandler(async(req,res)=>{
    try {
        const {
            name,
            description,
            price,
            category,
            quantity,
            brand,
            countInStock
        }= req.body;

        //validations
        switch(true){
            case !name :
                return res.status(400).json({message:"Name is required"})
            case !description:
                return res.status(400).json({message:"Description is required"})
            case !price:
                return res.status(400).json({message:"Price is required"})
            case !category:
                return res.status(400).json({message:"Category is required"})
            case !quantity:
                return res.status(400).json({message:"Quantity is required"})
            case !brand:
                return res.status(400).json({message:"Brand is required"})
            case !countInStock:
                return res.status(400).json({message:"CountInStock is required"})
        }

        let imageUrl;
        if (req.file) {
          imageUrl = await uploadImage(req.file);
        }
    
        // Create the new product
        const product = new Product({
          ...req.body,
          image: imageUrl,
          lastUpdated: new Date(),
        });
        await product.save();
        res.status(201).json({message:"Product added successfully",product})
    } catch (error) {
       console.log(error);
       res.status(400).json(error.message) 
    }
})

export const updateProductDetails=expressAsyncHandler(async(req,res)=>{
    try {
        const {
            name,
            description,
            price,
            category,
            quantity,
            brand,
            countInStock
        }= req.body;

        //validations
        switch(true){
            case !name :
                return res.status(400).json({message:"Name is required"})
            case !description:
                return res.status(400).json({message:"Description is required"})
            case !price:
                return res.status(400).json({message:"Price is required"})
            case !category:
                return res.status(400).json({message:"Category is required"})
            case !quantity:
                return res.status(400).json({message:"Quantity is required"})
            case !brand:
                return res.status(400).json({message:"Brand is required"})
            case !countInStock:
                return res.status(400).json({message:"CountInStock is required"})
        }
        const product =await Product.findByIdAndUpdate(req.params.id);

        // Upload image to Cloudinary if a file is provided
        if (req.file) {
            const imageUrl = await uploadImage(req.file);
            product.image = imageUrl;
        }

        // Update product details
        product.name = name;
        product.description = description;
        product.price = price;
        product.category = category;
        product.quantity = quantity;
        product.brand = brand;
        product.countInStock = countInStock;
  
        await product.save();
        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
})

export const removeProduct= expressAsyncHandler(async(req,res)=>{
    try {
        const product = await Product.findByIdAndDelete(req.params.id)

        res.json(product)
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
})
export const fetchProducts=expressAsyncHandler(async(req,res)=>{
    try {
        const pageSize =6;
        const keyword= req.query.keyword
        ? {name:{ $regex:req.query.keyword, $options:"i" }}
        : {}
        const count = await Product.countDocuments ({...keyword});
        const products = await Product.find({...keyword}).limit(pageSize);

        res.json({
            products,
            page:1,
            pages:Math.ceil(count/pageSize),
            hasMore:false
        });

    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
})

export const fetchProductById=expressAsyncHandler(async(req,res)=>{
    try {
        const product = await Product.findById(req.params.id)
        if(!product){
            return res.status(404).json({message:"Product not found"})
        }
        else{
            res.json(product)
        }
    } catch (error) {
        console.log(error)
        res.status(404).json(error.message)
    }
})

export const fetchAllProducts= expressAsyncHandler(async(req,res)=>{
    try {
        const products =await Product
                                .find({})
                                .populate('category')
                                .limit(12)
                                .sort({createdAt:-1})
        res.json(products)
    } catch (error) {
        console.log(error);
        res.status(500).json(error.message)
    }
})

export const addProductReview = expressAsyncHandler(async(req,res)=>{
    try {
        const {
            rating,comment
        }=req.body;
        const product = await Product.findById(req.params.id)
        if(product){
            const alreadyReviewed = product.reviews.find(r=>r.user.toString()===req.user._id.toString())
            if(alreadyReviewed){
                res.status(400).json({message:"Product already reviewed"})
            }

            const review ={
                name:req.user.username,
                rating:Number(rating),
                comment,
                user:req.user._id
            }
            product.reviews.push(review)
            product.numReviews=product.reviews.length
            product.rating=product.reviews.reduce((acc,item)=>acc+item.rating,0)/product.reviews.length
            await product.save()
            res.status(201).json({message:"Review added successfully"})
        }
        else{
            res.status(404).json({message:"Product not found"})
        }
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
})

export const fetchTopProducts= expressAsyncHandler(async(req,res)=>{
    try {
        const products =await Product.find({}).sort({rating:-1}).limit(4)
        res.json(products)
    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
})

export const fetchNewProducts=expressAsyncHandler(async(req,res)=>{
    try {
        const products=await Product
                                .find()
                                .sort({createdAt:-1})
                                .limit(4)
        res.json(products)
        

    } catch (error) {
        console.log(error);
        res.status(400).json(error.message)
    }
})

export const filterProducts = expressAsyncHandler(async (req, res) => {
    try {
      const { checked, radio } = req.body;
  
      let args = {};
      if (checked.length > 0) args.category = checked;
      if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
  
      const products = await Product.find(args);
      res.json(products);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Server Error" });
    }
});