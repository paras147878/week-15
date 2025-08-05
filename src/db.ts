// src/db.ts

import mongoose from "mongoose";

mongoose.connect("mongodb+srv://pankaj147878:pankajA@cluster0.6svuivj.mongodb.net/week-15");

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
});

const ContentSchema = new mongoose.Schema({
  title:String,  
  link: String,
  userID: [{type: mongoose.Types.ObjectId, ref: 'User'}],
  tags: {type: mongoose.Types.ObjectId, ref: 'Tag',
  required: true }
});

export const UserModel = mongoose.model("users", UserSchema);
export const ContentModel = mongoose.model("contents", ContentSchema);
