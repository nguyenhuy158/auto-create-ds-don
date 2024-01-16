const mongoose = require("mongoose");
const { mongoURI } = require("./constants");

mongoose.connect(mongoURI);

const db = mongoose.connection;

db.once("open", () => {
    console.log("Connected to MongoDB");
});

db.on("error", (error) => {
    console.error("MongoDB connection error:", error);
});

module.exports = mongoose;
