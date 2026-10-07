const express = require("express");
const connectDB = require("./config/DataConnection");
const path = require("path");
const cors = require("cors");

const app = express();

// === Middleware ===
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json());

// === Database Connection ===
connectDB();

// === Static Files ===
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// === Routes ===
app.use("/api/auth", require("./routes/auth.js"));
app.use("/assign", require("./routes/assignroute"));
app.use("/admin", require("./routes/adminroute"));
app.use("/user", require("./routes/Userroute"));
app.use("/prof", require("./routes/Profroute"));
app.use("/incidents", require("./routes/Incidentroute.js"));


// === Export App ===
module.exports = app;
