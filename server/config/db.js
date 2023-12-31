const mongoose = require('mongoose');
mongoose.set('strictQuery', false);

const dbConnection = async()=>{

    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`DB link : ${conn.connection.host}`);
    }catch(error){
        console.log(error);
    }
}

module.exports = dbConnection;