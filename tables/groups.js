const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    _id:        { type: mongoose.Schema.Types.ObjectId, auto: true },
    groupName:  { type: String, required: true, unique: true },
    points:     { type: Number, default: 0 }
  }, { _id: true }
);
  
groupSchema.virtual('groupId').get(function () {
    return this._id;
});

module.exports = mongoose.model('Groups', groupSchema);
  