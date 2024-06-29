import express from "express";
import cors from "cors"
import cookieParser from 'cookie-parser';
import connectDB from'./config/index.js'
import path from 'path'
import {v2 as cloudinary} from 'cloudinary';

const app=express()

import dotenv from "dotenv"


dotenv.config({
    path: './.env'
})

import morgan  from 'morgan'
app.use(morgan('dev'));

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 3030 ,()=>{
        console.log(`Server is running at port: http://localhost:${process.env.PORT}`);
    })
})
.catch((error)=>{
    console.log("MONGODB connection failed !!", error)
})

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

import userRouters from './routes/user.routes.js'
app.use("/api/users",userRouters);

import categoryRoutes from './routes/category.routes.js'
app.use("/api/category",categoryRoutes);

import prouductRoutes from './routes/product.routes.js'
app.use("/api/products",prouductRoutes)