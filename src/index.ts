import express from "express";
import { UserModel,ContentModel, LinkModel } from "./db";
import jwt from 'jsonwebtoken';
import { userMiddleware } from "./middleware";
import { random } from "./utils";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();


const app=express();
app.use(express.json());

app.use(cors({
    origin:process.env.CORS_ORIGIN,
}))


app.post('/api/v1/signup', async(req, res) => {

    const username=req.body.username;
    const password=req.body.password;


    await UserModel.create({
        username:username,
        password:password
    })

    res.json({
        message:"User signed up successfully"
    })

})

app.post('/api/v1/signin', async(req, res) => {

    const username=req.body.username;
    const password=req.body.password;


    const existingUser = await UserModel.findOne({
        username:username,
        password:password
    })
    console.log(existingUser);

    if(existingUser){
        const token=jwt.sign({
            id:existingUser._id
        },process.env.JWT_PASSWORD as string)
        res.json({
            message: "User signed in successfully",
            token: token
        });
    } else {
        res.status(401).json({
            message: "Invalid username or password"
        });
    }


})

app.post('/api/v1/content',userMiddleware ,async(req,res)=>{
    
    const link=req.body.link;
    const type=req.body.type;
    
    //@ts-ignore
    await ContentModel.create({
        title:req.body.title,
        link:link,
        type:type,
        //@ts-ignore
        userId: req.userId, // Ensure userMiddleware sets req.userId properly
        tags:[]
    })

     res.json({
        message:"Content created successfully"
    });

    
})

app.get('/api/v1/content',userMiddleware ,async(req,res)=>{
    
    //@ts-ignore
    const userId=req.userId;
    const content=await ContentModel.find({
        userId:userId,
    }).populate("userId","username")

     res.json({
        message:"Content get successfully",
        content:content
    });

    
})

app.delete('/api/v1/content',userMiddleware ,async(req,res)=>{

    const contentId=req.body.contentId;
    
    
    const deletedContent = await ContentModel.findOneAndDelete({
        _id:contentId,
        //@ts-ignore
        userId:req.userId
    })
    console.log(deletedContent);

     res.json({
        message:"Content deleted successfully"
    });
})

app.post("/api/v1/brain/share",userMiddleware,async(req,res)=>{
    const share=req.body.share;
    if(share){
        const existingLink=await LinkModel.findOne({
            //@ts-ignore
            userId:req.userId
        })

        if(existingLink){
            res.json({
                hash:existingLink.hash
            })

            return;
        }
        const hash=random(10);
        await LinkModel.create({
            //@ts-ignore
            userId:req.userId,
            hash:hash

        })

        res.json({
            message:"/share" + hash

        })
    }else{
        await LinkModel.deleteOne({
            //@ts-ignore
            userId:req.userId
        })

        res.json({
            message:"Removed Link"
        })
    }
   

})

app.get("/api/v1/brain/:shareLink",async(req,res)=>{
    const hash=req.params.shareLink;

    const link=await LinkModel.findOne({
        hash:hash
    }).populate("userId") // Ensure userId is populated if it's a reference

    if(!link){
        res.status(411).json({
            message:"Sorry incorrect input"
        })
        return;
    }


    //userId
    const content=await ContentModel.find({
        userId:link.userId as string // Explicitly cast userId to string if needed
    })
    console.log(content);

    const user=await UserModel.findOne({
        _id:link.userId
    })

    if(!user){
        res.status(411).json({
            message:"user not found,error should ideally not happen"
        })
        return;
    }

    res.json({
        username:user.username,
        content:content
    })
})


app.listen(3000);