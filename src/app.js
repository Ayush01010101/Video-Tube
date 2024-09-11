import express, { json, urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
const app=express();

app.use(cors({
    origin:process.env.PORT_ORIGIN,
    credentials:true,
    
}))

app.use(json({limit:"16kb"}))

app.use(urlencoded({
    limit:"16kb",
    
}))

app.use(cookieParser())
app.use(express.static("Public"))

export{app}