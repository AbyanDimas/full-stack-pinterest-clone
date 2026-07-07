import Notification from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .populate("sender", "username displayName img")
      .populate("pinId", "media")
      .sort({ createdAt: -1 })
      .limit(20);

    res.status(200).json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch notifications!" });
  }
};

export const markAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, read: false },
      { $set: { read: true } },
    );
    res.status(200).json({ message: "Notifications marked as read." });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications!" });
  }
};
