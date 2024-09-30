const express=require('express');
const app=express();
const cors = require('cors');
const colors=require("colors");
app.use(cors());
app.use(express.json());
const dotenv=require('dotenv');
const connectDB = require('./config/db');
const userRoutes=require('./routes/userRoutes')
const chatRoutes=require('./routes/chatRoutes')
const messageRoutes=require('./routes/messageRoutes')
dotenv.config();
connectDB();
const {chats} =require('./data/data');
const { notFound, errorHandler } = require('./middleware/errormiddleware');
const PORT=process.env.BACKEND_PORT || 5000;
app.listen(PORT,console.log(`Server Listening on port ${PORT}`.yellow.bold));
// app.get("/",(req,res)=>{
//     res.send("API is running")
// });
app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);
app.use(notFound);
app.use(errorHandler);
