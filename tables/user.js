const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:       { type: String, required: true, unique: true },
    displayName:    { type: String, required: true, unique: true },
    userType:       { type: Number, enum: [0, 1], default: 0, required: true}, // 0 = user, 1 = admin/host
    passwordHash:   { type: String, required: true },
    groupId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Groups' },
});

userSchema.virtual('userId').get(function () {
    return this._id;
});
module.exports = mongoose.model('User', userSchema);
