const mongoose =require('mongoose');
async function connectDB(){
    console.log(process.env.BACKEND_PORT);
    try{
        const con=await mongoose.connect(process.env.MONGO_CONNECTION_URL,{useNewUrlParser:true ,useUnifiedTopology:true});
        console.log(`Database Connected : ${con.connection.host}`.cyan.underline);

    }catch(err){
        console.log(`Connection Failed :${err.message}`.red.bold);
    }
}
module.exports=connectDB;