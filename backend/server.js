import express from "express";
import { connectToDB } from "./config/db.js";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import cors from "cors";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// Allowed domains
const allowedOrigins = [
  "https://sabrinaflix-uwfo.vercel.app",
  "http://localhost:5173",
  "http://172.20.10.5:5173",
];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Other middlewares
app.use(express.json());

app.get("/", (req, res) => {
  res.send("This Is Sabrinaflix (Bearer Token Version)");
});

// ------------ AUTH HELPER (NO COOKIES) -----------------
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ------------ VERIFY TOKEN MIDDLEWARE ------------------
const verifyToken = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token provided." });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ===================== SIGNUP =====================
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw new Error("All fields are required!");
    }

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "User already exists." });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res
        .status(400)
        .json({ message: "Username is taken, try another name." });

    const hashedPassword = await bcryptjs.hash(password, 10);

    const userDoc = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    const token = createToken(userDoc._id);

    return res.status(200).json({
      user: userDoc,
      token,
      message: "User created successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ===================== LOGIN =====================
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res
        .status(400)
        .json({ message: "Username and password are required." });

    const userDoc = await User.findOne({ username });
    if (!userDoc)
      return res.status(400).json({ message: "Invalid credentials." });

    const isPasswordValid = await bcryptjs.compare(password, userDoc.password);
    if (!isPasswordValid)
      return res.status(400).json({ message: "Invalid credentials." });

    const token = createToken(userDoc._id);

    return res.status(200).json({
      user: userDoc,
      token,
      message: "Logged in successfully.",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ===================== FETCH USER =====================
app.get("/api/fetch-user", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId).select("-password");
    if (!userDoc) return res.status(400).json({ message: "User not found." });

    return res.status(200).json({ user: userDoc });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ===================== LOGOUT =====================
app.post("/api/logout", async (req, res) => {
  // For token-based auth, logout is frontend-only.
  return res.status(200).json({ message: "Logged out successfully." });
});

// ===================== SUBSCRIPTIONS =====================
app.post("/api/subscription/start-trial", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId);

    if (!userDoc) return res.status(400).json({ message: "User not found." });

    const trialStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    userDoc.subscriptionStatus = "trial";
    userDoc.trialStartDate = trialStartDate;
    userDoc.subscriptionEndDate = subscriptionEndDate;

    await userDoc.save();

    res.status(200).json({
      message: "Free trial started successfully!",
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionEndDate: userDoc.subscriptionEndDate,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/subscription/status", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId).select("-password");
    if (!userDoc) return res.status(400).json({ message: "User not found." });

    if (
      userDoc.subscriptionEndDate &&
      new Date(userDoc.subscriptionEndDate) < new Date()
    ) {
      userDoc.subscriptionStatus = "expired";
      await userDoc.save();
    }

    const isActive =
      (userDoc.subscriptionStatus === "trial" ||
        userDoc.subscriptionStatus === "active") &&
      userDoc.subscriptionEndDate > new Date();

    res.status(200).json({
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionEndDate: userDoc.subscriptionEndDate,
      trialStartDate: userDoc.trialStartDate,
      isActive,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/subscription/upgrade", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId);
    if (!userDoc) return res.status(400).json({ message: "User not found." });

    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    userDoc.subscriptionStatus = "active";
    userDoc.subscriptionEndDate = subscriptionEndDate;

    await userDoc.save();

    res.status(200).json({
      message: "Subscription upgraded successfully!",
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionEndDate: userDoc.subscriptionEndDate,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ============================================
app.listen(PORT, "0.0.0.0", () => {
  connectToDB();
  console.log(`Bearer Token Server running on PORT ${PORT}`);
});
