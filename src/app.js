import express, { json, urlencoded } from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import { router as userRouter  } from './routes/userRouter.js';
import { router as tweetRouter } from './routes/tweetRouter.js';
import { router as videorouter } from './routes/videoRouter.js';
import {router as subscriptionrouter} from './routes/subscriptionRouter.js'
import { Playlist } from './models/Playlist.model.js';
const app=express();

app.use(cors({
    origin:process.env.PORT_ORIGIN,
    credentials:true,
    
}))

app.use(json({limit:"16kb"}))

app.use(urlencoded({
    limit:"16kb",
    extended:true

    
}))     

app.use(cookieParser())
app.use(express.static("Public"))

app.use("/api/v1/users/",userRouter)
app.use("/api/v1/videos",videorouter)
app.use("/api/v1/tweet/",tweetRouter)
app.use("/api/v1/subscription",subscriptionrouter)


app.use("/api/v1/playlist",Playlist)

export{app}