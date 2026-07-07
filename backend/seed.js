import mongoose from "mongoose";
import dotenv from "dotenv";
import { S3Client, PutObjectCommand, CreateBucketCommand, HeadBucketCommand } from "@aws-sdk/client-s3";
import User from "./models/user.model.js";
import Pin from "./models/pin.model.js";
import crypto from "crypto";

dotenv.config();

const seed = async () => {
  try {
    // 1. Connect to MongoDB
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO);
    console.log("Connected to MongoDB.");

    // 2. Setup MinIO Client
    console.log("Configuring MinIO S3 Client...");
    const s3 = new S3Client({
      region: process.env.MINIO_REGION || "us-east-1",
      endpoint: process.env.MINIO_ENDPOINT,
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true,
    });
    
    const bucketName = process.env.MINIO_BUCKET_NAME || "pinterest";

    // Check if bucket exists, if not create it
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucketName }));
      console.log(`Bucket '${bucketName}' already exists.`);
    } catch (err) {
      if (err.$metadata && err.$metadata.httpStatusCode === 404) {
        console.log(`Creating bucket '${bucketName}'...`);
        await s3.send(new CreateBucketCommand({ Bucket: bucketName }));
        console.log(`Bucket '${bucketName}' created.`);
      } else {
        throw err;
      }
    }

    // 3. Create a dummy user for the pins
    console.log("Creating dummy user...");
    const user = new User({
      displayName: "Seed User",
      username: "seeder_" + crypto.randomBytes(4).toString("hex"),
      email: `seeder_${Date.now()}@example.com`,
      hashedPassword: "hashedpassword123",
      img: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
    });
    const savedUser = await user.save();
    console.log("User created:", savedUser.username);

    // 4. Generate random pins with images from picsum
    const totalPins = 50;
    console.log(`Generating ${totalPins} random pins...`);

    const titles = [
      "Beautiful Landscape", "Urban Photography", "Minimalist Workspace", 
      "Delicious Food", "Abstract Art", "Nature Vibes", "Retro Tech",
      "Cozy Room", "Travel Destination", "Coffee Time"
    ];

    for (let i = 0; i < totalPins; i++) {
      // Random dimensions for masonry layout variety
      const w = 400;
      const h = Math.floor(Math.random() * 400) + 400; // between 400 and 800

      console.log(`[${i+1}/${totalPins}] Fetching image from picsum.photos (${w}x${h})...`);
      const imgRes = await fetch(`https://picsum.photos/${w}/${h}`);
      const arrayBuffer = await imgRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const fileName = `seed-${Date.now()}-${crypto.randomBytes(4).toString("hex")}.jpg`;

      // Upload to MinIO
      await s3.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ContentType: "image/jpeg",
        })
      );

      // Create Pin in DB
      const randomTitle = titles[Math.floor(Math.random() * titles.length)] + " " + i;
      const pin = new Pin({
        media: fileName,
        width: w,
        height: h,
        title: randomTitle,
        description: `This is a generated pin with a random image from picsum.photos. Pin number ${i+1}.`,
        user: savedUser._id,
        tags: ["inspiration", "photography", "seed"],
      });
      await pin.save();
      console.log(` -> Uploaded and saved pin: ${randomTitle}`);
    }

    console.log("Seeding complete! Refresh your frontend to see the new pins.");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  }
};

seed();
