const Server = require('../models/server.js');

exports.createServer = async (req , res , next) =>{
    const id = req.body.id;
    const ip = req.body.ip;
    const setting = req.body.set;
    const autoSet = req.body.autoSet;
    const record = req.body.record;
    const autoRecord = req.body.autoRecord;
    const error = req.body.error;
    const name = req.body.name;
    const baseUrl = req.body.baseUrl;
    const secretKey = req.body.secretKey;
    const max = req.body.max;
    const priority = req.body.priority;
    const cpu = req.body.cpu;
    const ram = req.body.ram;
    const hard = req.body.hard;
    const description = req.body.description;

    try{
        const existingServer = await Server.findOne({
            isRemoved:{$ne:true} ,
            $or:[{serverId:id , ip:ip , baseUrl:baseUrl}]});
        if(existingServer){
            let errorMsg = 'server already exists';
            if(existingServer.serverId === id){
                errorMsg = ServerIdAlreadyExistingErrorMsg;
            }else if(existingServer.ip === ip){
                errorMsg = ServerIpAlreadyExistingErrorMsg;
            }else if(existingServer.baseUrl === baseUrl){
                errorMsg = ServerBaseUrlAlreadyExistingErrorMsg;
            }

            const error = new Error(errorMsg);
            error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
            return next(error)
        }

        const newServer = new Server({
            serverId:id,
            ip : ip,
            setting : setting,
            autoSet : autoSet,
            record : record,
            autoRecord : autoRecord,
            error : error,
            name : name,
            baseUrl : baseUrl,
            secretKey : secretKey,
            max : max,
            priority : priority,
            cpu : cpu,
            ram : ram,
            hard : hard,
            description : description
        })

        const savedServer = await newServer.save();
        return res.status(SuccessfulPostResponseHttpStatusCode).json({
            message:"host server was created successfully",
            id:savedServer.serverId
        })
    }catch(err){
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode?error.httpStatusCode:InternalServerErrorErrorHttpStatusCode;
        return next(error);
    }
}

exports.editServer = async (req , res , next) => {
    const id = req.body.id;
    const newId = req.body.newId;
    const ip = req.body.ip;
    const setting = req.body.set;
    const autoSet = req.body.autoSet;
    const record = req.body.record;
    const autoRecord = req.body.autoRecord;
    const error = req.body.error;
    const name = req.body.name;
    const baseUrl = req.body.baseUrl;
    const secretKey = req.body.secretKey;
    const max = req.body.max;
    const priority = req.body.priority;
    const cpu = req.body.cpu;
    const ram = req.body.ram;
    const hard = req.body.hard;
    const description = req.body.description;
    const serverType = req.body.serverType;


    try{
        const server = await Server.findOne({serverId:id , isRemoved:{$ne:true}});
    
        if(!server){
            const error = new Error(ServerNotFoundErrorMsg);
            error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
            return next(error)
        }
    
            server.ip = ip?ip:server.ip,
            server.setting = typeof setting !== "undefined"?setting:server.setting,
            server.autoSet = typeof autoSet !== "undefined"?autoSet:server.autoSet,
            server.record = typeof record !== "undefined"?record:server.record,
            server.autoRecord = typeof autoRecord !== "undefined"?autoRecord:server.autoRecord,
            server.error = error?error:server.error,
            server.name = name?name:server.name,
            server.baseUrl = baseUrl?baseUrl:server.baseUrl,
            server.secretKey = secretKey?secretKey:server.secretKey,
            server.max = max?max:server.max,
            server.priority = priority?priority:server.priority,
            server.cpu = cpu?cpu:server.cpu,
            server.ram = ram?ram:server.ram,
            server.hard = hard?hard:server.hard,
            server.description = description?description:server.description;
            server.serverType = serverType?serverType:server.serverType;
    
        const editedServer = await server.save();
    
        return res.status(SuccessfulPostResponseHttpStatusCode).json({
            message:"host server was updated successfully",
            serverId:editedServer.serverId
        })
    }catch(err){
            const error = new Error(err.message);
            error.httpStatusCode = error.httpStatusCode?error.httpStatusCode:InternalServerErrorErrorHttpStatusCode;
            return next(error);
    }
}

exports.deleteServer = async (req , res , next)=>{
    const id = req.body.id;

    try{
        const removedServer = await Server.findOne({serverId:id , isRemoved:{$ne:true}});

        if(!removedServer){
            const error = new Error(ServerNotFoundErrorMsg);
            error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
            return next(error)
        }
    
        removedServer.isRemoved = true;
        const deletedServer = await removedServer.save();
    
        return res.status(SuccessfulPostResponseHttpStatusCode).json({
            message:"host server is deleted successfully",
            serverId:deletedServer.serverId
        })
    }catch(err){
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode?error.httpStatusCode:InternalServerErrorErrorHttpStatusCode;
        return next(error);
    }
}


exports.recoverServer = async (req , res , next)=>{
    const id = req.body.id;

    try{
        const removedServer = await Server.findOne({serverId:id , isRemoved:{$ne:false}});

        if(!removedServer){
            const error = new Error(ServerNotFoundErrorMsg);
            error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
            return next(error)
        }
    
        removedServer.isRemoved = false;
        const recoveredServer = await removedServer.save();
    
        return res.status(SuccessfulPostResponseHttpStatusCode).json({
            message:"host server is recovered successfully",
            serverId:recoveredServer.serverId
        })
    }catch(err){
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode?error.httpStatusCode:InternalServerErrorErrorHttpStatusCode;
        return next(error);
    }
}

exports.fetchAll = async( req , res ,next )=>{
    try{
        const servers = await Server.find();

        return res.status(SuccessfulPostResponseHttpStatusCode).json({servers: servers})

    }catch(err){
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode?error.httpStatusCode:InternalServerErrorErrorHttpStatusCode;
        return next(error);
    }
}

exports.getServer = async (req,res,next) => {
    const id = req.body.id;

    try{
        const server = await Server.findOne({serverId:id , isRemoved:{$ne:true}});

        if(!server){
            const error = new Error(ServerNotFoundErrorMsg);
            error.httpStatusCode = InternalServerErrorErrorHttpStatusCode;
            return next(error)
        }

        return res.status(SuccessfulPostResponseHttpStatusCode).json({server: server});

    }catch(err){
        const error = new Error(err.message);
        error.httpStatusCode = error.httpStatusCode?error.httpStatusCode:InternalServerErrorErrorHttpStatusCode;
        return next(error);
    }            
}