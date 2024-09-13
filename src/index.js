import dotenv from 'dotenv'
import connect from './db/index.js'
import { app } from './app.js'
import { PORT } from './constant.js'
dotenv.config({path:"/env"})
connect()
.then(()=>{
    try {
        app.listen(PORT || 8000 ,()=>{
            console.log("sucessfully connected to MongoDB listening on ", PORT)
        })
    } catch{
        app.on("error",(err)=>{
            console.log("MONGODB connection error", err);
            throw err
        })
    }
    
})