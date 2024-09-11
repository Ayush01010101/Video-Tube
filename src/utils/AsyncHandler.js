const AsyncHandler=(Handlerfunx)=>{
   (req,res,next)=>{
        Promise.resolve(Handlerfunx(req,res,next)).catch((error)=>  next(error))
    }
}


export {AsyncHandler}