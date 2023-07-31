const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    userName: {
        type: String,
        trim: true,
        required: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    userMail: {
        type: String,
        trim: true,
        required: true,
        unique: true,
    },
    userPassword: {
        type: String,
        trim: true,
    },
    userRoll : {
        type: String,
        required: true,
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User