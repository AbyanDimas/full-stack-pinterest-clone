import Comment from "../models/comment.model.js";
import User from "../models/user.model.js";

export const getPostComments = async (req, res) => {
  const { postId } = req.params;

  const comments = await Comment.find({ pin: postId })
    .populate("user", "username img displayName")
    .sort({ createdAt: -1 });

  res.status(200).json(comments);
};

import Pin from "../models/pin.model.js";
import Notification from "../models/notification.model.js";

export const addComment = async (req, res) => {
  const { description, pin } = req.body;
  const userId = req.userId;

  const comment = await Comment.create({ description, pin, user: userId });

  // Create notification for post owner
  const post = await Pin.findById(pin);
  if (post && post.user.toString() !== userId) {
    await Notification.create({
      recipient: post.user,
      sender: userId,
      type: "comment",
      pinId: pin,
      text: description,
    });
  }

  res.status(201).json(comment);
};
