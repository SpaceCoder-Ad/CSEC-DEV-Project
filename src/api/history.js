const express = require("express");
const router = express.Router();
const ChatHistory = require("../models/chatHistoryModel");
const authMiddleware = require("../middleware/authMiddleware");

// Get user's chat history (protected route)
router.get("/", authMiddleware, async (req, res) => {
  try {
    const history = await ChatHistory.find({ userId: req.user.id }).sort({
      timestamp: -1,
    });
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: "Error fetching chat history" });
  }
});

// Save new chat message (this can be part of your chatbot controller)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { message } = req.body;
    const chatMessage = new ChatHistory({
      userId: req.user.id,
      message,
    });
    await chatMessage.save();
    res.status(201).json({ message: "Chat message saved" });
  } catch (error) {
    res.status(500).json({ message: "Error saving chat message" });
  }
});

module.exports = router;
