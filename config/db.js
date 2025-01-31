const mongoose = require("mongoose");

// Connect to MongoDB

exports.connect = () => {
  mongoose
    .connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Could not connect to MongoDB", err));
};
// Define schema for files
