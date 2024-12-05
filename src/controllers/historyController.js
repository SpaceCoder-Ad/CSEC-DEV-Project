const ChatHistory = require("../models/chatHistoryModel");

async function saveChatHistory(userId, userMessage, botResponse) {
  const chatHistory = await ChatHistory.findOne({ userId });

  if (!chatHistory) {
    const newHistory = new ChatHistory({
      userId,
      conversation: [{ userMessage, botResponse }],
    });
    await newHistory.save();
  } else {
    chatHistory.conversation.push({ userMessage, botResponse });
    await chatHistory.save();
  }
}

async function getChatHistory(req, res) {
  const { userId } = req.params;
  const history = await ChatHistory.findOne({ userId });
  res.json(history || { conversation: [] });
}

module.exports = { saveChatHistory, getChatHistory };
