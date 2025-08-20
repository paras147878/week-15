import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

import { UserModel, ContentModel, LinkModel } from "./db.js";
import { userMiddleware } from "./middleware.js";
import { random } from "./utils.js";

const JWT_SECRET = process.env.JWT_SECRET || "super_secret_key";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "DELETE"],
  })
);

app.use(express.json());

// Signup
app.post("/api/v1/signup", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const exists = await UserModel.findOne({ username });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    await UserModel.create({ username, password }); // 🔴 TODO: hash password in real apps

    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "7d" });
    res.json({ message: "User signed up", token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

// Signin
app.post("/api/v1/signin", async (req, res) => {
  try {
    const { username, password } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password required" });
    }

    const existingUser = await UserModel.findOne({ username, password });
    if (!existingUser) {
      return res.status(403).json({ message: "Incorrect credentials" });
    }

    const token = jwt.sign({ id: existingUser._id }, JWT_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

// Create content
app.post("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const { link, type, tags = [], title = "" } = req.body || {};
    if (!link || !type) {
      return res.status(400).json({ message: "link and type are required" });
    }

    await ContentModel.create({
      link,
      type,
      title,
      userID: req.userID,
      tags,
    });

    res.json({ message: "Content added" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

// Get content
app.get("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const content = await ContentModel.find({ userID: req.userID }).populate(
      "userID",
      "username"
    );
    res.json({ content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

// Delete content
app.delete("/api/v1/content", userMiddleware, async (req, res) => {
  try {
    const { contentID } = req.body || {};
    if (!contentID) {
      return res.status(400).json({ message: "contentID required" });
    }

    const result = await ContentModel.deleteOne({
      _id: contentID,
      userID: req.userID,
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Not found or not allowed" });
    }

    res.json({ message: "Deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

// Toggle share
app.post("/api/v1/brain/share", userMiddleware, async (req, res) => {
  try {
    const { share } = req.body || {};
    if (share) {
      const existing = await LinkModel.findOne({ userID: req.userID });
      if (existing) {
        return res.json({ hash: existing.hash });
      }
      const hash = random(10);
      await LinkModel.create({ userID: req.userID, hash });
      return res.json({ hash });
    } else {
      await LinkModel.deleteOne({ userID: req.userID });
      return res.json({ message: "Link unshared" });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

// Public brain
app.get("/api/v1/brain/:shareLink", async (req, res) => {
  try {
    const hash = req.params.shareLink;
    const link = await LinkModel.findOne({ hash });
    if (!link) {
      return res.status(411).json({ message: "Sorry, incorrect input" });
    }

    const [content, user] = await Promise.all([
      ContentModel.find({ userID: link.userID }),
      UserModel.findById(link.userID),
    ]);

    if (!user) {
      return res.status(411).json({ message: "User not found" });
    }

    res.json({ username: user.username, content });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Internal error" });
  }
});

app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
