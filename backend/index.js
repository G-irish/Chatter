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
const { notFound, errorHandler } = require('./middleware/errormiddleware');
const PORT=process.env.BACKEND_PORT || 5000;
// app.get("/",(req,res)=>{
    //     res.send("API is running")
    // });
app.use("/api/user",userRoutes);
app.use("/api/chat",chatRoutes);
app.use("/api/message",messageRoutes);    
app.use(notFound);
app.use(errorHandler);
const server=app.listen(PORT,console.log(`Server Listening on port ${PORT}`.yellow.bold));
const io=require("socket.io")(server,{
    pingTimeout:60000,
    cors:{
        origin:"http://localhost:3000"
    }
});
io.on("connection",(socket)=>{
    console.log("connected to socket");
    socket.on('setup',(userData)=>{
        socket.join(userData._id);
        console.log(userData._id);
        socket.emit('connected');
    });
    socket.on('join chat',(room)=>{
        socket.join(room);
        console.log('user joined room'+room);
    });
    socket.on('typing',(room)=>{
        socket.in(room).emit('typing');
    });
    socket.on('stop typing',(room)=>{
        socket.in(room).emit('stop typing');
    });
    socket.on('new message',(newMessageRecieved)=>{
        var chat=newMessageRecieved.chat;
        if(!chat.users){
            console.log("chat.user not defined");
        }
        chat.users.forEach(user=>{
            if(user._id===newMessageRecieved.sender._id) return;
            socket.in(user._id).emit("message recieved",newMessageRecieved);
        });
    });
    socket.off("setup",()=>{
        console.log("USER DISCONNTCTED");
        socket.leave(userData._id);
    });
})
