import Message from "../models/message.model.js";

export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ recipient: req.userId }, { sender: req.userId }],
    })
      .populate("sender", "username displayName img")
      .populate("recipient", "username displayName img")
      .sort({ createdAt: -1 })
      .limit(50);

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch messages!" });
  }
};

export const sendMessage = async (req, res) => {
  const { recipient, text } = req.body;

  try {
    const newMessage = await Message.create({
      sender: req.userId,
      recipient,
      text,
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Failed to send message!" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Message.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } },
    );
    res.status(200).json({ message: "Messages marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update messages!" });
  }
};
