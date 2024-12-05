import { fileURLToPath } from "url";
import path from "path";
import express from "express";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import session from "express-session";
import User from "./models/userModel.js";
import bodyParser from "body-parser";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "console";
import dotenv from "dotenv";
import readline from "readline";

dotenv.config(); // Load environment variables

// Replicating __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Set up Gemini API client
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Middleware for parsing request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files
app.use(express.static(path.join(__dirname, "public")));

// Connect to MongoDB Atlas
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("MongoDB Atlas connected"))
//   .catch((err) => console.log("MongoDB Atlas connection error: ", err));

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas connected"))
  .catch((err) => console.log("MongoDB Atlas connection error: ", err));

// Set up session handling
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // set to true if using HTTPS
  }),
);

// Middleware for checking if user is logged in
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    return next();
  } else {
    return res.redirect("/login");
  }
};

app.get("/signup", (req, res) => {
  res.render("signup");
});

app.post("/signup", async (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).send("Passwords do not match.");
  }

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).send("User already exists.");
    }

    const user = new User({ username, email, password });
    await user.save();
    res.redirect("/login");
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).send("Error registering user.");
  }
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send("Invalid credentials.");
    }

    // Compare the provided password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      const errorDetails = "Invalid username or password.";
      res.status(400).render("invalid-credentials", { errorDetails });
      // return res.status(400).send("Invalid credentials.");
    }

    // Set user session after successful login
    req.session.userId = user._id; // Store user ID in session
    console.log("User session:", req.session);

    // Redirect to the chat page after login
    res.redirect("/chat");
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).send("Error logging in.");
  }
});

// Dashboard (protected route)
app.get("/chat", isAuthenticated, (req, res) => {
  res.render("chat"); // Render the 'logedin' page after login
});

import ChatHistory from "./models/chatHistoryModel.js"; // Import the ChatHistory model

app.post("/chat", async (req, res) => {
  const { userInput } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: "No input provided" });
  }

  try {
    // Retrieve the user's chat history from the database
    let chatHistory = await ChatHistory.findOne({ user: req.session.userId });

    if (!chatHistory) {
      // If no chat history exists, create a new entry for the user
      chatHistory = new ChatHistory({
        user: req.session.userId,
        messages: [],
      });
    }

    // Add the user input to the chat history
    chatHistory.messages.push({ role: "user", message: userInput });

    // Prepare the payload with 'parts' for the chat API
    const chatPayload = {
      parts: chatHistory.messages.map((entry) => ({
        text: entry.message, // Convert each history message into 'text' format
      })),
      generationConfig: {
        maxOutputTokens: 500,
      },
    };

    const chat = await model.startChat(chatPayload);
    const result = await chat.sendMessage(userInput);

    // Assuming the response contains the AI response text
    const response = await result.response;
    const aiResponseText = await response.text(); // Get the AI's text response

    // Add the AI response to the chat history
    chatHistory.messages.push({ role: "ai", message: aiResponseText });

    // Save the updated chat history
    await chatHistory.save();

    res.json({ response: aiResponseText });
  } catch (error) {
    console.error("Error during AI request:", error);

    if (error.message.includes("fetch failed")) {
      res.status(500).json({
        error: "Failed to fetch from the AI API. Please try again later.",
      });
    } else {
      res
        .status(500)
        .json({ error: "Internal server error.", details: error.message });
    }
  }
});

app.post("/new-chat", async (req, res) => {
  try {
    // Create a new chat history for the user by clearing the old history
    const chatHistory = await ChatHistory.findOneAndUpdate(
      { user: req.session.userId },
      { $set: { messages: [] } }, // Empty the messages array for a fresh start
      { new: true, upsert: true }, // Create if not exists
    );

    // Return a success message or empty history
    res.json({ message: "New chat started!", history: chatHistory.messages });
  } catch (error) {
    console.error("Error starting new chat:", error);
    res.status(500).json({ error: "Failed to start a new chat" });
  }
});
app.get("/chat-history", isAuthenticated, async (req, res) => {
  try {
    // Fetch chat history for the logged-in user
    const chatHistory = await ChatHistory.findOne({ user: req.session.userId });

    if (!chatHistory) {
      return res.json({ history: [] }); // No history available
    }

    // Return chat history messages with roles (user or ai)
    res.json({ history: chatHistory.messages });
  } catch (error) {
    console.error("Error fetching chat history:", error);
    res.status(500).json({ error: "Failed to fetch chat history." });
  }
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Error logging out.");
    }
    res.redirect("/");
  });
});

// Home route
app.get("/", (req, res) => {
  res.render("index");
});

// Start the server
const port = 5000;

app.listen(port, () => {
  console.log(`Server running on Port: ${port}`);
});
