import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config(); // Load .env file

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.json());
app.use(express.static("public")); // Serve static files

// Set up Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Route to handle the user input
app.post("/chat", async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "No input provided" });
  }

  try {
    // Get the AI's response from the model
    const result = await model.generateContent(userInput);
    const aiResponse = result.response.text();

    // Send the AI response back to the frontend
    res.json({ response: aiResponse });
  } catch (error) {
    console.error("Error during AI request:", error);
    res.status(500).json({ error: "Failed to get response from AI" });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
