// server/server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Example route
app.get("/", (req, res) => {
  res.send("Hello from the backend!");
});

// Example POST route (for data from React)
app.post("/api/message", (req, res) => {
  const { message } = req.body;
  console.log("Received message:", message);
  res.json({ success: true, reply: `Server got your message: ${message}` });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));