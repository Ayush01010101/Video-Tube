const AsyncHandler=(Handlerfunx)=>{
   return (req,res,next)=>{
        Promise.resolve(Handlerfunx(req,res,next)).catch((error)=>  next(error))
    }
}

    
export {AsyncHandler}