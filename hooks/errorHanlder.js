
module.exports = (error , req , res , next) => {
    if(error){
        console.log('request error:\n'+error);
        return res.status(error.httpStatusCode).json({
            message: 'sorry your request can not be get done at the moment',
            error: error.message,
            customCode:error.customCode?error.customCode:null
        })
    }
}