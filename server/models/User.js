import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    profileImage: {
        type: String,
        default: ''
    }
}, {timestamps: true})

export const User = mongoose.model('User', userSchema)