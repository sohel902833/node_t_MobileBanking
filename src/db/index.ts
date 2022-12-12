import {connect,set} from 'mongoose'
import dotenv from 'dotenv'
dotenv.config();
const url:string=process.env.MONGO_CONNECTION_STRING as string;

export const connectDb=()=>{
    set("strictQuery",true)
    connect(url,{})
    .then(()=>{
        console.log("Database Connection Successful.")
    }).catch(err=>{
        console.log(err)
    })
}
