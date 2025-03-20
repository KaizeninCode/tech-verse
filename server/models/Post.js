import mongoose from "mongoose";
import { User } from "./User";

const postSchema = new mongoose.Schema({
    caption: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: User,
        required: true,
    },
}, {timestamps: true})

export const Post = mongoose.model('Post', postSchema)