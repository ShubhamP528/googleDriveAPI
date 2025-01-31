const express = require("express");
const app = express();
const PORT = 8900;
const authRoute = require("./routes/userAuth");
const { connect } = require("./config/db");

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
connect();

app.use(express.json());

app.use("/auth", authRoute);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
