import expressAsyncHandler from "express-async-handler"
import categoryModels from "../models/category.models.js"


export const createCategory=expressAsyncHandler(async(req,res)=>{
    try {
        const {name}=req.body;
        if(!name){
            return res.status(400).json({message:"name is required"})
        }
        const existingCategory=await categoryModels.findOne({name})
        if(existingCategory){
            return res.json({
                error:"Already exists"
            })
        }
        const category =await new categoryModels({name});
        await category.save();
        return res.status(201).json({
            message:"category created successfully",
            category
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json(error)
    }
})

export const updateCategory=expressAsyncHandler(async(req,res)=>{
    try {
        const {name} =req.body;
        const {categoryId} =req.params;

        const category =await categoryModels.findOne({
            _id:categoryId
        })
        if(!category){
            return res.status(404).json({message:"category not found"})
        }
        category.name=name;
        const updatedCategory = await category.save();
        return res.status(200).json({
            message:"category updated successfully",
            updatedCategory
        })
    } catch (error) {
        console.log(error);
        return res.status(400).json(error)
    }
})

export const deleteCategory=expressAsyncHandler(async(req,res)=>{
    try {
        const removeCategory = await categoryModels.findByIdAndDelete(req.params.categoryId);
        res.json(removeCategory)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

export const listCategory=expressAsyncHandler(async(req,res)=>{
    try {
        const all =await categoryModels.find({})
        return res.status(200).json(all)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error)
    }
})

export const readCategory = expressAsyncHandler(async(req,res)=>{
    try {
        const category = await categoryModels.findOne({
            _id:req.params.id
        })
        res.json(category)
    } catch (error) {
        console.log(error);
        return res.status(500).json(error.message)
    }
})