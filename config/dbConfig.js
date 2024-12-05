require("dotenv").config();
const mongoose = require("mongoose");

// Replace the <username>, <password>, and <dbname> with your MongoDB Atlas credentials and database name
const dbURI =
  "mongodb+srv://<username>:<password>@cluster0.mongodb.net/zorkdb?retryWrites=true&w=majority";

// const dbURI = process.env.MONGO_URI;
//
mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => {
    console.log("Database connection error:", err);
    process.exit(1); // Exit the process if the connection fails
  });
