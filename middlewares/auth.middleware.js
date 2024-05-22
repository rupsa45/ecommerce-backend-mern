import jwt from 'jsonwebtoken'
import User from '../models/user.models.js'
import expressAsyncHandler from 'express-async-handler'

const authentication =expressAsyncHandler(async (req,res,next)=>{
    try {
        const token = req.cookies.jwt;
        if (!token) {
          res.status(401);
          throw new Error('Not authorized, no token');
        }
    
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.userId).select('-password');
    
        if (!req.user) {
          res.status(401);
          throw new Error('Not authorized, user not found');
        }
    
        next();
    
    } catch (error) {
        res.status(401).json({message:error.message})
    }
})

const authorizeAdmin =(req,res,next)=>{
    if(req.user && req.user.isAdmin) {
       next()
    }
    else{
        return res.status(401).send({message:"Not authorized as a admin "})
    }
}

export {
    authentication,
    authorizeAdmin
}