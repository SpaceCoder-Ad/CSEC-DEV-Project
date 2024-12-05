const { generateResponse } = require("../api/chatbot");
const { saveChatHistory } = require("./historyController");

async function handleChat(req, res) {
  const { userInput, userId } = req.body;
  try {
    const botResponse = await generateResponse(userInput, userId);

    // Optionally, save the conversation to the chat history
    await saveChatHistory(userId, userInput, botResponse);

    res.json({ response: botResponse });
  } catch (err) {
    res.status(500).json({ message: "Error generating response" });
  }
}

module.exports = { handleChat };
