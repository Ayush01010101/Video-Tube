class ApiResponce{
    constructor(statuscode,message,data){
        this.statuscode=statuscode
        this.message=message
        this.data=data
        this.success=statuscode<400
    }
}

export {ApiResponce}