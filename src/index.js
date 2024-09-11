import dotenv from 'dotenv'
import connect from './db/index.js'
dotenv.config({path:"/env"})
import { app } from './app.js'
import { PORT } from './constant.js'
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