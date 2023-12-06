//define virtual-server schema for storing main server in database

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serverSchema = new Schema({
    serverId:{
        type: Number,
        required:false
    },
    setting:{
        type: Boolean,
        required:true,
        default: true
    },
    autoSet:{
        type: Boolean,
        required:true,
        default: true
    },
    record:{
        type: Boolean,
        required:true,
        default: true
    },
    autoRecord:{
        type: Boolean,
        required:true,
        default: true
    },
    error:{
        type: String,
        required:false,
        default: true
    },
    name:{
        type: String,
        required:true
    },
    ip:{
        type: String,
        required:true
    },
    baseUrl:{
        type: String,
        required:true
    },
    secretKey:{
        type: String,
        required:true
    },
    max:{
        type: Number,
        required:true
    },
    priority:{
        type: String,
        required:false,
        default:5
    },
    cpu:{
        type:String,
        required:false,
        default:null
    },
    ram:{
        type:String,
        required:false,
        default:null
    },
    hard:{
        type:String,
        required:false,
        default:null
    },
    description:{
        type:String,
        required:false,
        default:null
    },
    serverType:{
        type:String,
        required:true,
        default:'normal'
    },
    platform:{
        type:String,
        required:true,
        default:'big blue button'
    },
    isRemoved:{
        type: Boolean,
        required:true,
        default: false
    }
} , {timestamps: true})

module.exports = mongoose.model('Server' , serverSchema);