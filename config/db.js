const mongoose = require('mongoose');


const connectDb = async ()=>{
    try{
       await mongoose.connect(process.env.MONGO_URL) ;
       console.log('Database connected')
    }catch(err){
        console.log(err)
        console.log('Error connecting database')
    }
    
}

module.exports = connectDb;