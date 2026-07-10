import User from "../models/user.model.js";
import Follow from "../models/follow.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";
import crypto from "crypto";

const s3 = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT || "http://localhost:9000",
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY || "root",
    secretAccessKey: process.env.MINIO_SECRET_KEY || "rootroot",
  },
  forcePathStyle: true,
});

export const registerUser = async (req, res) => {
  const { username, displayName, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const newHashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    username,
    displayName,
    email,
    hashedPassword: newHashedPassword,
  });

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  res.status(201).json(detailsWithoutPassword);
};
export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const user = await User.findOne({ email: String(email) });

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const isPasswordCorrect = await bcrypt.compare(password, user.hashedPassword);

  if (!isPasswordCorrect) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  res.status(200).json(detailsWithoutPassword);
};

export const logoutUser = async (req, res) => {
  res.clearCookie("token");

  res.status(200).json({ message: "Logout successful" });
};

export const getUser = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  const { hashedPassword, ...detailsWithoutPassword } = user.toObject();

  const followerCount = await Follow.countDocuments({ following: user._id });
  const followingCount = await Follow.countDocuments({ follower: user._id });

  const token = req.cookies.token;

  if (!token) {
    res.status(200).json({
      ...detailsWithoutPassword,
      followerCount,
      followingCount,
      isFollowing: false,
    });
  } else {
    jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
      if (!err) {
        const isExists = await Follow.exists({
          follower: payload.userId,
          following: user._id,
        });

        res.status(200).json({
          ...detailsWithoutPassword,
          followerCount,
          followingCount,
          isFollowing: isExists ? true : false,
        });
      }
    });
  }
};

export const followUser = async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username });

  const isFollowing = await Follow.exists({
    follower: req.userId,
    following: user._id,
  });

  if (isFollowing) {
    await Follow.deleteOne({ follower: req.userId, following: user._id });
  } else {
    await Follow.create({ follower: req.userId, following: user._id });
  }

  res.status(200).json({ message: "Successful" });
};

export const updateUser = async (req, res) => {
  const { id } = req.params;
  
  if (req.userId !== id) {
    return res.status(403).json({ message: "You can only update your own account!" });
  }

  const { username, displayName, email } = req.body;
  const updateData = {};
  if (username) updateData.username = username;
  if (displayName) updateData.displayName = displayName;
  if (email) updateData.email = email;

  // Handle image upload if a file was provided
  if (req.files && req.files.media) {
    const media = req.files.media;
    const fileName = `profile-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;
    
    try {
      const processedBuffer = await sharp(media.data)
        .resize(300, 300, { fit: "cover" })
        .jpeg({ quality: 80 })
        .toBuffer();

      const bucketName = process.env.MINIO_BUCKET_NAME || "pinterest";
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: processedBuffer,
          ContentType: "image/jpeg",
        })
      );
      
      updateData.img = fileName;
    } catch (uploadErr) {
      console.error("Profile image upload failed:", uploadErr);
      return res.status(500).json({ message: "Failed to upload profile image!" });
    }
  }

  try {
    const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true }).select("-hashedPassword");
    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update user!" });
  }
};
