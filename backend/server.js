import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDB } from "./config/db.js";
import User from "./models/user.model.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// --------------------------------------------------
// ALLOWED FRONTEND ORIGINS
// --------------------------------------------------
const allowedOrigins = [
  "https://sabrinaflix-uwfo.vercel.app",
  "http://localhost:5173",
  "http://172.20.10.5:5173",
];

// --------------------------------------------------
// CORS MIDDLEWARE
// --------------------------------------------------
app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// --------------------------------------------------
app.use(express.json());

// --------------------------------------------------
// HOME ROUTE
// --------------------------------------------------
app.get("/", (req, res) => {
  res.send("SabrinaFlix Backend – Bearer Token Version");
});

// --------------------------------------------------
// TOKEN HELPER
// --------------------------------------------------
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// --------------------------------------------------
// AUTH MIDDLEWARE
// --------------------------------------------------
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

// ====================================================================
// AUTH ROUTES
// ====================================================================

// SIGNUP
app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password)
      return res.status(400).json({ message: "All fields are required." });

    const emailExists = await User.findOne({ email });
    if (emailExists)
      return res.status(400).json({ message: "User already exists." });

    const usernameExists = await User.findOne({ username });
    if (usernameExists)
      return res.status(400).json({ message: "Username already taken." });

    const hashed = await bcryptjs.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashed,
    });

    const token = createToken(user._id);

    res.status(200).json({
      user,
      token,
      message: "User created successfully.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// LOGIN
app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    if (!username || !password)
      return res.status(400).json({ message: "Missing fields." });

    const user = await User.findOne({ username });
    if (!user)
      return res.status(400).json({ message: "Invalid credentials." });

    const valid = await bcryptjs.compare(password, user.password);
    if (!valid)
      return res.status(400).json({ message: "Invalid credentials." });

    const token = createToken(user._id);

    res.status(200).json({
      user,
      token,
      message: "Login successful.",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// FETCH USER
app.get("/api/fetch-user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user)
      return res.status(400).json({ message: "User not found." });

    res.status(200).json({ user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// LOGOUT (Frontend only)
app.post("/api/logout", (req, res) => {
  return res.status(200).json({ message: "Logged out successfully." });
});

// ====================================================================
// SUBSCRIPTION ROUTES
// ====================================================================

// START TRIAL
app.post("/api/subscription/start-trial", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user)
      return res.status(400).json({ message: "User not found." });

    const trialStart = new Date();
    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    user.subscriptionStatus = "trial";
    user.trialStartDate = trialStart;
    user.subscriptionEndDate = subscriptionEnd;

    await user.save();

    res.status(200).json({
      message: "Free trial started.",
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// SUBSCRIPTION STATUS
app.get("/api/subscription/status", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user)
      return res.status(400).json({ message: "User not found." });

    // auto expire
    if (user.subscriptionEndDate < new Date()) {
      user.subscriptionStatus = "expired";
      await user.save();
    }

    const isActive =
      (user.subscriptionStatus === "trial" ||
        user.subscriptionStatus === "active") &&
      user.subscriptionEndDate > new Date();

    res.status(200).json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
      trialStartDate: user.trialStartDate,
      isActive,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPGRADE
app.post("/api/subscription/upgrade", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user)
      return res.status(400).json({ message: "User not found." });

    const subscriptionEnd = new Date();
    subscriptionEnd.setMonth(subscriptionEnd.getMonth() + 1);

    user.subscriptionStatus = "active";
    user.subscriptionEndDate = subscriptionEnd;

    await user.save();

    res.status(200).json({
      message: "Subscription upgraded.",
      subscriptionStatus: user.subscriptionStatus,
      subscriptionEndDate: user.subscriptionEndDate,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====================================================================
// RATINGS
// ====================================================================
app.post("/api/ratings", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType, rating } = req.body;

    if (!contentId || !contentType || !rating)
      return res.status(400).json({ message: "Missing fields." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    let existing = user.ratings.find(
      (r) => r.contentId === contentId && r.contentType === contentType
    );

    if (existing) {
      existing.rating = rating;
      existing.createdAt = new Date();
    } else {
      user.ratings.push({
        contentId,
        contentType,
        rating,
        createdAt: new Date(),
      });
    }

    await user.save();

    res.status(200).json({ message: "Rating saved." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/ratings/:contentId/:contentType", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    const rating = user.ratings.find(
      (r) => r.contentId === contentId && r.contentType === contentType
    );

    res.status(200).json({ rating: rating || null });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====================================================================
// SAVE FOR LATER
// ====================================================================
app.post("/api/save-for-later", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType, title, posterPath, backdropPath, overview } = req.body;

    if (!contentId || !contentType || !title)
      return res.status(400).json({ message: "Missing fields." });

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    const exists = user.savedForLater.find(
      (item) => item.contentId === contentId && item.contentType === contentType
    );

    if (exists)
      return res.status(400).json({ message: "Already saved." });

    user.savedForLater.push({
      contentId,
      contentType,
      title,
      posterPath,
      backdropPath,
      overview,
      savedAt: new Date(),
    });

    await user.save();
    res.status(200).json({ message: "Saved." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/save-for-later", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");

    if (!user) return res.status(400).json({ message: "User not found." });

    res.status(200).json({ savedItems: user.savedForLater });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/save-for-later/:contentId/:contentType", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    user.savedForLater = user.savedForLater.filter(
      (item) => !(item.contentId === contentId && item.contentType === contentType)
    );

    await user.save();

    res.status(200).json({
      message: "Removed.",
      savedItems: user.savedForLater,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.get("/api/save-for-later/check/:contentId/:contentType", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType } = req.params;

    const user = await User.findById(req.userId);
    if (!user) return res.status(400).json({ message: "User not found." });

    const isSaved = user.savedForLater.some(
      (item) => item.contentId === contentId && item.contentType === contentType
    );

    res.status(200).json({ isSaved });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ====================================================================
// START SERVER
// ====================================================================
app.listen(PORT, "0.0.0.0", () => {
  connectToDB();
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
