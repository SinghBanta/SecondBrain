import mongoose,{model, Schema } from 'mongoose';
require('dotenv').config();

if (!process.env.MONGO_URL) {
    throw new Error("MONGO_URL is not defined in the environment variables");
}
mongoose.connect(process.env.MONGO_URL as string);

const userSchema = new Schema({
    username: { type: String, unique: true },
    password: String,
});

export const UserModel = model("User", userSchema);


const ContentSchema=new Schema({
    title:String,
    type:String,
    link:String,
    tags:[{type:mongoose.Types.ObjectId, ref:'Tag'}],
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true}
})


const LinkSchema=new Schema({
    hash:String,
    userId:{type:mongoose.Types.ObjectId,ref:'User',required:true,unique:true}
})


export const LinkModel=model("Link",LinkSchema);
export const ContentModel=model("Content",ContentSchema);
   

