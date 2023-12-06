//define virtual-server schema for storing main server in database

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const scaleliteSchema = new Schema({
    server:{
        type:mongoose.Types.ObjectId,
        ref:'Server',
        required:true
    },
    type:{
        type: String,
        required:true
    },
    isRemoved:{
        type: Boolean,
        required:true,
        default: false
    }
} , {timestamps: true})

module.exports = mongoose.model('Scalelite' , scaleliteSchema);