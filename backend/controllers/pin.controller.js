import Pin from "../models/pin.model.js";
import User from "../models/user.model.js";
import Like from "../models/like.model.js";
import Save from "../models/save.model.js";
import Board from "../models/board.model.js";
import sharp from "sharp";
import jwt from "jsonwebtoken";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// Configure MinIO S3 Client
const s3 = new S3Client({
  region: process.env.MINIO_REGION || "us-east-1",
  endpoint: process.env.MINIO_ENDPOINT, // e.g. "http://127.0.0.1:9000"
  credentials: {
    accessKeyId: process.env.MINIO_ACCESS_KEY,
    secretAccessKey: process.env.MINIO_SECRET_KEY,
  },
  forcePathStyle: true, // IMPORTANT for MinIO
});

export const getPins = async (req, res) => {
  const pageNumber = Number(req.query.cursor) || 0;
  const search = req.query.search;
  const userId = req.query.userId;
  const boardId = req.query.boardId;
  const LIMIT = 21;

  const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };
  const safeSearch = search ? escapeRegex(String(search)) : null;

  const pins = await Pin.find(
    safeSearch
      ? {
          $or: [
            { title: { $regex: safeSearch, $options: "i" } },
            { tags: { $in: [safeSearch] } },
          ],
        }
      : userId
        ? { user: String(userId) }
        : boardId
          ? { board: String(boardId) }
          : {},
  )
    .limit(LIMIT)
    .skip(pageNumber * LIMIT);

  const hasNextPage = pins.length === LIMIT;

  // await new Promise((resolve) => setTimeout(resolve, 3000));

  res
    .status(200)
    .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
};

export const getPin = async (req, res) => {
  const { id } = req.params;
  const pin = await Pin.findById(id).populate(
    "user",
    "username img displayName",
  );

  console.log(pin);
  res.status(200).json(pin);
};

export const getSavedPins = async (req, res) => {
  const userId = req.params.userId;
  const pageNumber = Number(req.query.cursor) || 0;
  const LIMIT = 21;

  try {
    const saves = await Save.find({ user: userId })
      .populate("pin")
      .skip(pageNumber * LIMIT)
      .limit(LIMIT)
      .sort({ createdAt: -1 });

    const pins = saves.map((save) => save.pin).filter((pin) => pin != null);
    const hasNextPage = saves.length === LIMIT;

    res
      .status(200)
      .json({ pins, nextCursor: hasNextPage ? pageNumber + 1 : null });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch saved pins." });
  }
};

export const createPin = async (req, res) => {
  const {
    title,
    description,
    link,
    board,
    tags,
    textOptions,
    canvasOptions,
    newBoard,
  } = req.body;

  const media = req.files.media;

  if ((!title, !description, !media)) {
    return res.status(400).json({ message: "All fields are required!" });
  }

  const parsedTextOptions = JSON.parse(textOptions || "{}");
  const parsedCanvasOptions = JSON.parse(canvasOptions || "{}");

  const metadata = await sharp(media.data).metadata();

  const originalOrientation =
    metadata.width < metadata.height ? "portrait" : "landscape";
  const originalAspectRatio = metadata.width / metadata.height;

  let clientAspectRatio;
  let width;
  let height;

  if (parsedCanvasOptions.size !== "original") {
    clientAspectRatio =
      parsedCanvasOptions.size.split(":")[0] /
      parsedCanvasOptions.size.split(":")[1];
  } else {
    parsedCanvasOptions.orientation === originalOrientation
      ? (clientAspectRatio = originalOrientation)
      : (clientAspectRatio = 1 / originalAspectRatio);
  }

  width = Math.round(metadata.width);
  height = Math.round(metadata.width / clientAspectRatio);

  const textLeftPosition = Math.round((parsedTextOptions.left * width) / 375);
  const textTopPosition = Math.round(
    (parsedTextOptions.top * height) / parsedCanvasOptions.height,
  );

  let croppingStrategy = "";

  if (parsedCanvasOptions.size !== "original") {
    if (originalAspectRatio > clientAspectRatio) {
      croppingStrategy = ",cm-pad_resize";
    }
  } else {
    if (
      originalOrientation === "landscape" &&
      parsedCanvasOptions.orientation === "portrait"
    ) {
      croppingStrategy = ",cm-pad_resize";
    }
  }

  const fileName = Date.now() + "-" + media.name.replace(/\s+/g, "-");

  const resizeOptions = {
    width: width,
    height: height,
  };

  if (croppingStrategy === ",cm-pad_resize") {
    resizeOptions.fit = "contain";
    resizeOptions.background = parsedCanvasOptions.backgroundColor || "#ffffff";
  } else {
    resizeOptions.fit = "cover";
  }

  const sharpInstance = sharp(media.data).resize(resizeOptions);

  if (parsedTextOptions.text) {
    const fontSize = Math.round(parsedTextOptions.fontSize * 2.1);
    const svgText = `
      <svg width="${width}" height="${height}">
        <text x="${textLeftPosition}" y="${textTopPosition + fontSize}" font-size="${fontSize}" font-family="Arial, sans-serif" fill="${parsedTextOptions.color || "#000"}">${parsedTextOptions.text}</text>
      </svg>
    `;
    sharpInstance.composite([{ input: Buffer.from(svgText), top: 0, left: 0 }]);
  }

  try {
    // Process image to buffer
    const processedBuffer = await sharpInstance.toBuffer();

    // Upload to MinIO
    const bucketName = process.env.MINIO_BUCKET_NAME || "pinterest";
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: processedBuffer,
        ContentType: media.mimetype || "image/jpeg",
      }),
    );

    let newBoardId;

    if (newBoard) {
      const res = await Board.create({
        title: newBoard,
        user: req.userId,
      });
      newBoardId = res._id;
    }

    const newPin = await Pin.create({
      user: req.userId,
      title,
      description,
      link: link || null,
      board: newBoardId || board || null,
      tags: tags ? tags.split(",").map((tag) => tag.trim()) : [],
      media: fileName, // Only store the key/filename in DB
      width: width,
      height: height,
    });

    return res.status(201).json(newPin);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "An error occurred" });
  }
};

export const interactionCheck = async (req, res) => {
  const { id } = req.params;
  const token = req.cookies.token;

  const likeCount = await Like.countDocuments({ pin: id });

  if (!token) {
    return res.status(200).json({ likeCount, isLiked: false, isSaved: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, payload) => {
    if (err) {
      return res
        .status(200)
        .json({ likeCount, isLiked: false, isSaved: false });
    }

    const userId = payload.userId;

    const isLiked = await Like.findOne({
      user: userId,
      pin: id,
    });
    const isSaved = await Save.findOne({
      user: userId,
      pin: id,
    });

    return res.status(200).json({
      likeCount,
      isLiked: isLiked ? true : false,
      isSaved: isSaved ? true : false,
    });
  });
};

export const interact = async (req, res) => {
  const { id } = req.params;

  const { type } = req.body;

  if (type === "like") {
    const isLiked = await Like.findOne({
      pin: id,
      user: req.userId,
    });

    if (isLiked) {
      await Like.deleteOne({
        pin: id,
        user: req.userId,
      });
    } else {
      await Like.create({
        pin: id,
        user: req.userId,
      });
    }
  } else {
    const isSaved = await Save.findOne({
      pin: id,
      user: req.userId,
    });

    if (isSaved) {
      await Save.deleteOne({
        pin: id,
        user: req.userId,
      });
    } else {
      await Save.create({
        pin: id,
        user: req.userId,
      });
    }
  }

  return res.status(200).json({ message: "Successful" });
};
