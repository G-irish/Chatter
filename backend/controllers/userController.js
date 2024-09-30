const asyncHandler=require('express-async-handler');
const User =require('../models/userModel');
const generateToken=require('../config/generateToken');
const registerUser=asyncHandler(async (req,res)=>{
    const {name,email,password,pic} =req.body;
    if(!name || !email || !password){
        res.status(400);
        throw new Error("Please enter all fields...");
    }
    const userExists=await User.findOne({email});
    if(userExists){
        res.status(400);
        throw new Error("User already exists...");
    }
    const newuser=new User({
        name,
        email,
        password,
        pic,
    })
    if(newuser){
        await newuser.save();
        res.status(201).json({
            _id:newuser._id,
            name:newuser.name,
            email:newuser.email,
            pic:newuser.pic,
            token:generateToken(newuser._id),
        });
    }
    else{
        res.status(400);
        throw new Error("Failed to create user");
    }
});

const authUser=asyncHandler(async (req,res)=>{
    const {email,password}=req.body;
    const curruser=await User.findOne({email});
    if(curruser && (await curruser.matchPassword(password))){
        res.json({
            _id:curruser._id,
            name:curruser.name,
            email:curruser.email,
            pic:curruser.pic,
            token:generateToken(curruser._id),
        });
    }
    else{
        res.status(401);
        throw new Error("Invalid email or password");
    }
});
const allUsers=asyncHandler(async (req,res)=>{
    const keyword=req.query.search ? {
        $or:[
            {name:{$regex:req.query.search,$options:"i"}},
            {email:{$regex:req.query.search,$options:"i"}}
        ]
    } : {};
    const users=await User.find(keyword);
    res.send(users);

})
module .exports={registerUser,authUser,allUsers};