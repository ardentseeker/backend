import express from "express";
import dotenv from "dotenv";
import contactRoutes from "./routes/contactRoutes.js";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());

// explicit CORS config to ensure headers are set in Lambda responses
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Api-Key",
    "X-Amz-Security-Token",
  ],
  credentials: false,
};
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// fallback - ensure headers are present on all responses
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", corsOptions.origin);
  res.setHeader("Access-Control-Allow-Methods", corsOptions.methods.join(","));
  res.setHeader(
    "Access-Control-Allow-Headers",
    corsOptions.allowedHeaders.join(",")
  );
  next();
});

app.get("/", (req, res) => {
  res.send("Contact List API is running...");
});

app.use("/api/contacts", contactRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

export default app;
