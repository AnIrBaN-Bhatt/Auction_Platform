import mongoose from "mongoose";

export const connection = () => {
    mongoose.connect(process.env.MONGO_URI,{
        dbName : "MERN_AUCTON_PLATFORM"
    }).then(()=>{
        console.log("Database connected successfully");
    }).catch(err =>{{
        console.log(`Some error occurred while connecting to database ${err}`);
    }})
}