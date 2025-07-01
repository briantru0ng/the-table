const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    time:   { type: Date, defaul: Date.now },
    msg:    { type: String, required: true, unique: true },

});

chatSchema.index({ 
    userId: 1, 
    time: 1 }, 
    { unique: true }
);

module.exports = mongoose.model('Chat', chatSchema);
