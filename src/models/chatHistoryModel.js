// const mongoose = require("mongoose");

// const chatHistorySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true,
//   },
//   message: String,
//   timestamp: { type: Date, default: Date.now },
// });

// const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);
// module.exports = ChatHistory;
//
// import mongoose from "mongoose";

// const chatHistorySchema = new mongoose.Schema(
//   {
//     user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Reference to the User model
//     messages: [
//       {
//         role: { type: String, enum: ["user", "ai"], required: true },
//         message: { type: String, required: true },
//         timestamp: { type: Date, default: Date.now },
//       },
//     ],
//   },
//   { timestamps: true }, // Automatically adds createdAt and updatedAt fields
// );

// const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

// export default ChatHistory;

import mongoose from "mongoose";

const chatHistorySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  messages: [
    {
      role: { type: String, enum: ["user", "ai"], required: true },
      message: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    },
  ],
});

const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

export default ChatHistory;

// import mongoose from "mongoose";

// const chatHistorySchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
//   chats: [
//     {
//       title: { type: String, required: true }, // Title or ID for each chat tab
//       messages: [
//         {
//           role: { type: String, enum: ["user", "ai"], required: true },
//           message: { type: String, required: true },
//         },
//       ],
//     },
//   ],
// });

// const ChatHistory = mongoose.model("ChatHistory", chatHistorySchema);

// export default ChatHistory;
