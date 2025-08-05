
import express from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { UserModel, ContentModel } from "./db.js";
import { JWT_PASSWORD } from "./config.js";

 
const app = express();
app.use(express.json());

app.post("/api/v1/signup", async (req, res) => {
  try {
    // zod validation (if applicable)
    const username = req.body.username;
    const password = req.body.password;

    await UserModel.create({
      username: username,
      password: password
    });

    res.json({
      message: "User signed up"
    });
  } catch (e) {
    res.status(409).json({
      message: "User already exists"
    });
  }
});


app.post("/api/v1/signin",  async (req, res) =>{
     const username = req.body.username;
     const password = req.body.password;
     const existingUser = await UserModel.findOne({
        username,
        password
     })
     if (existingUser) {
        const token = jwt.sign({
            id: existingUser._id
        }, JWT_PASSWORD)
        res.json({
            token
        })
     } else{
        res.status(403).json({
            message: "Incrrect credentials"
        })
     }
})



app.post("/api/v1/content", async (req, res) => {
  const link = req.body.link;
  const type = req.body.type;

  await ContentModel.create({
    link,
    type,
    //@ts-ignore (if no type declared)
    userID: req.userID,
    tags: [],
  });

  return res.json({
    message: "Content added",
  });
});

app.get("/api/v1/content", async (req, res) =>{
    //@ts-ignore
const userID = req.userID;
const content = await ContentModel.find({
    userID: userID
}).populate("userID")
res.json({
    content
})

})
app.delete("/api/v1/content", (req, res) =>{

})
app.post("/api/v1/brain/share", (req, res) =>{

})
app.get("/api/v1/brain/:shareLink", (req, res) =>{

})

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
