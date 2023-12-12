const mongoose = require("mongoose");

// Replace 'your_connection_string' with your actual MongoDB connection string
const { mongoURI } = require("./constants");

mongoose.connect(mongoURI);

const db = mongoose.connection;

// Event listener for successful connection
db.once("open", () => {
    console.log("Connected to MongoDB");
});

// Event listener for connection errors
db.on("error", (err) => {
    console.error("MongoDB connection error:", err);
});

module.exports = mongoose;
