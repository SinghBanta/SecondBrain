import { NextFunction,Request,Response }  from "express";
import jwt from 'jsonwebtoken';


export const  userMiddleware=(req:Request,res:Response,next:NextFunction)=>{
    const header=req.headers['authorization'];
    const decoded=jwt.verify(header as string,process.env.JWT_PASSWORD as string) as {id:string};
    
    if(decoded){
        //@ts-ignore
        req.userId=decoded.id;//Here we are setting the userId in the request object
        next()
    }
    else{
        res.status(403).json({
            message:"You are not logged in"
        })
    }


}