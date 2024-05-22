import expressAsyncHandler from "express-async-handler"
import User from '../models/user.models.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/createToken.js'



export const createUser=expressAsyncHandler(async(req,res)=>{
    try {
        const { username, email, password } = req.body;

        // Check if all fields are provided
        if (!username || !email || !password) {
            return res.status(400).json({ message: "Please fill all the fields" });
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Generate salt and hash the password
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        // Create a new user
        const newUser = new User({
            username,
            email,
            password: hashPassword
        });

        // Save the user to the database
        await newUser.save();
        generateToken(res,newUser._id);
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        console.log(error.message);
        res.status(500)
        .json({message:error.message})
    }
})

export const loginUser=expressAsyncHandler(async(req,res)=>{
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

       
        const existingUser = await User.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

       
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

       
        const token=generateToken(res, existingUser._id);

        res.status(200).json({
            _id: existingUser._id,
            username: existingUser.username,
            email: existingUser.email,
            isAdmin:existingUser.isAdmin,
            token
        });
    } catch (error) {
        return res.status(400).json({message:"Invalid email or password"})
    }
})

export const logoutUser=expressAsyncHandler(async(req,res)=>{
    try {
        res.cookie('jwt','',{
            httpOnly:true,
            expires:new Date(0)
        })
        res.status(200).json({message:"User logged out successfully"})
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message:error.message})
    }
})

export const getAllUsers = expressAsyncHandler(async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        console.log(error.message);
        res.status(500).json({ message: error.message });
    }
});

export const getCurrentUserProfile=expressAsyncHandler(async(req,res)=>{
    try {
        const user =await User.findById(req.user._id);

        if(user){
            res.json({
                _id:user._id,
                username:user.username,
                email:user.email,
            })
        }
    } catch (error) {
        res.status(404).
        json({message:"User not found"})
    }
})


export const updateCurrentUserProfile=expressAsyncHandler(async(req,res)=>{
    try {
        const user =await User.findById(req.user._id)
        if(user){
            user.username=req.body.username || user.username
            user.email=req.body.email || user.email
        }
        if(req.body.password){
            const salt = await bcrypt.genSalt(10);
            const hashPassword = await bcrypt.hash(req.body.password , salt);
            user.password=hashPassword
        }

        const updatedUser =await user.save()
        res.json({
            _id:updatedUser._id,
            username:updatedUser.username,
            email:updatedUser.email,
            isAdmin:updatedUser.isAdmin
        })
    } catch (error) {
        res.status(404).json({message:error.message})
    }
})

export const deletUserById=expressAsyncHandler(async(req,res)=>{
    try {
        const user =await User.findById(req.params.id);
        if(user){
            if(user.isAdmin){
                res.status(400).json({message:"You can't delete an admin user"})
            }
        }
        await User.deleteOne({
            _id:user._id
        })
        res.json({message:"User deleted successfully"})
    } catch (error) {
        res.status(404).json({message:error.message})
    }
})


export const getUserById=expressAsyncHandler(async(req,res)=>{
    try {
        const user =await User.findById(req.params.id).select("-password")

        if(user){
            res.json(user)
        }
    } catch (error) {
        res.status(404).json({message:error.message})
    }
})

export const updateUserId=expressAsyncHandler(async(req,res)=>{
    try {
        const user =await User.findById(req.params.id);
        if(user){
            user.username=req.body.username || user.username
            user.email=req.body.email || user.email
            user.isAdmin=Boolean(req.body.isAdmin);
        }
        const updatedUser = await user.save()
        res.json({
            _id:updatedUser._id,
            username:updatedUser.username,
            email:updatedUser.email,    
            isAdmin:updatedUser.isAdmin
        })
    } catch (error) {
        res.status(404).json({message:error.message})
    }
})