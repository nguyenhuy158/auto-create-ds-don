const mongoose = require("mongoose");
const { mongoURI } = require("./constants");

mongoose.connect(mongoURI);

const database = mongoose.connection;

database.once("open", () => {
    console.log("[database] Connected");
});

database.on("error", (error) => {
    console.error("[database] Error: ", error);
});

module.exports = mongoose;
