//define virtual-server schema for storing main server in database

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const serverMessSchema = new Schema({
    server:{
        type:mongoose.Types.ObjectId,
        ref:'Server',
        required:true
    },
    errorCode:{
        type: String,
        required:false,
        default: ''
    },
    errorMessage:{
        type: Boolean,
        required:true
    }
} , {timestamps: true})

module.exports = mongoose.model('ServerMess' , serverMessSchema);