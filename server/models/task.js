const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TaskSchema = new Schema({
    tasktitle:{
        type : String,
        required: true
    },
    date:{
        type : Date,
        required: true
    },
    priority:{
        type : String,
        required: true
    },
    description:{
        type : String,
        required: true
    },
    isCompleted:{
        type : Boolean
    }
});

module.exports = mongoose.model('Task', TaskSchema);