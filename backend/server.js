import express from "express";
import { connectToDB } from "./config/db.js";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middlewares

const allowedOrigins = [
  "https://sabrinaflix-uwfo.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173"
];

// CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("❌ Blocked by CORS:", origin);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Type'],
    optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
  })
);


// Other middlewares
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("This Is Sabrinaflix");
});

// Test endpoint to verify CORS
app.get("/api/test-cors", (req, res) => {
  res.json({ 
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

app.post("/api/signup", async (req, res) => {
  const { username, email, password } = req.body;

  try {
    if (!username || !email || !password) {
      throw new Error("All fields are required!");
    }

    const emailExists = await User.findOne({ email });

    if (emailExists) {
      return res.status(400).json({ message: "User already exists." });
    }

    const usernameExists = await User.findOne({ username });

    if (usernameExists) {
      return res
        .status(400)
        .json({ message: "Username is taken, try another name." });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);

    const userDoc = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    // JWT

    if (userDoc) {
      // jwt.sign(payload, secret, options)
      const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    return res
      .status(200)
      .json({ user: userDoc, message: "User created successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const userDoc = await User.findOne({ username });
    if (!userDoc) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    const isPasswordValid = await bcryptjs.compareSync(
      password,
      userDoc.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // JWT
    if (userDoc) {
      // jwt.sign(payload, secret, options)
      const token = jwt.sign({ id: userDoc._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
    }

    return res
      .status(200)
      .json({ user: userDoc, message: "Logged in successfully." });
  } catch (error) {
    console.log("Error Logging in: ", error.message);
    res.status(400).json({ message: error.message });
  }
});

app.get("/api/fetch-user", async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const userDoc = await User.findById(decoded.id).select("-password");

    if (!userDoc) {
      return res.status(400).json({ message: "No user found." });
    }

    res.status(200).json({ user: userDoc });
  } catch (error) {
    console.log("Error in fetching user: ", error.message);
    return res.status(400).json({ message: error.message });
  }
});

app.post("/api/logout", async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out successfully" });
});

// Middleware to verify JWT token
const verifyToken = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "No token provided." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// Start free trial (1 month)
app.post("/api/subscription/start-trial", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if user already has an active subscription or trial
    if (userDoc.subscriptionStatus === 'trial' || userDoc.subscriptionStatus === 'active') {
      const endDate = new Date(userDoc.subscriptionEndDate);
      if (endDate > new Date()) {
        return res.status(400).json({ 
          message: "You already have an active subscription or trial.",
          subscriptionEndDate: userDoc.subscriptionEndDate
        });
      }
    }

    // Start 1 month free trial
    const trialStartDate = new Date();
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    userDoc.subscriptionStatus = 'trial';
    userDoc.trialStartDate = trialStartDate;
    userDoc.subscriptionEndDate = subscriptionEndDate;

    await userDoc.save();

    res.status(200).json({
      message: "Free trial started successfully!",
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionEndDate: userDoc.subscriptionEndDate
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check subscription status
app.get("/api/subscription/status", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId).select("-password");

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if subscription has expired
    if (userDoc.subscriptionEndDate && new Date(userDoc.subscriptionEndDate) < new Date()) {
      userDoc.subscriptionStatus = 'expired';
      await userDoc.save();
    }

    const isActive = (userDoc.subscriptionStatus === 'trial' || userDoc.subscriptionStatus === 'active') &&
                     userDoc.subscriptionEndDate &&
                     new Date(userDoc.subscriptionEndDate) > new Date();

    res.status(200).json({
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionEndDate: userDoc.subscriptionEndDate,
      trialStartDate: userDoc.trialStartDate,
      isActive
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Upgrade to paid subscription
app.post("/api/subscription/upgrade", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    // Set subscription to active and extend by 1 month
    const subscriptionEndDate = new Date();
    subscriptionEndDate.setMonth(subscriptionEndDate.getMonth() + 1);

    userDoc.subscriptionStatus = 'active';
    userDoc.subscriptionEndDate = subscriptionEndDate;

    await userDoc.save();

    res.status(200).json({
      message: "Subscription upgraded successfully!",
      subscriptionStatus: userDoc.subscriptionStatus,
      subscriptionEndDate: userDoc.subscriptionEndDate
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add rating for content
app.post("/api/ratings", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType, rating } = req.body;

    if (!contentId || !contentType || !rating) {
      return res.status(400).json({ message: "All fields are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if user already rated this content
    const existingRating = userDoc.ratings.find(
      r => r.contentId === contentId && r.contentType === contentType
    );

    if (existingRating) {
      // Update existing rating
      existingRating.rating = rating;
      existingRating.createdAt = new Date();
    } else {
      // Add new rating
      userDoc.ratings.push({
        contentId,
        contentType,
        rating,
        createdAt: new Date()
      });
    }

    await userDoc.save();

    res.status(200).json({
      message: "Rating saved successfully!",
      rating: existingRating || userDoc.ratings[userDoc.ratings.length - 1]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's rating for specific content
app.get("/api/ratings/:contentId/:contentType", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType } = req.params;

    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    const rating = userDoc.ratings.find(
      r => r.contentId === contentId && r.contentType === contentType
    );

    res.status(200).json({ rating: rating || null });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Save content for later
app.post("/api/save-for-later", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType, title, posterPath, backdropPath, overview } = req.body;

    if (!contentId || !contentType || !title) {
      return res.status(400).json({ message: "Content ID, type, and title are required." });
    }

    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    // Check if already saved
    const alreadySaved = userDoc.savedForLater.find(
      item => item.contentId === contentId && item.contentType === contentType
    );

    if (alreadySaved) {
      return res.status(400).json({ message: "Content already saved." });
    }

    // Add to saved list
    userDoc.savedForLater.push({
      contentId,
      contentType,
      title,
      posterPath,
      backdropPath,
      overview,
      savedAt: new Date()
    });

    await userDoc.save();

    res.status(200).json({
      message: "Content saved successfully!",
      savedItem: userDoc.savedForLater[userDoc.savedForLater.length - 1]
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get saved for later items
app.get("/api/save-for-later", verifyToken, async (req, res) => {
  try {
    const userDoc = await User.findById(req.userId).select("-password");

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    res.status(200).json({
      savedItems: userDoc.savedForLater || []
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove from saved for later
app.delete("/api/save-for-later/:contentId/:contentType", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType } = req.params;

    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    // Remove from saved list
    userDoc.savedForLater = userDoc.savedForLater.filter(
      item => !(item.contentId === contentId && item.contentType === contentType)
    );

    await userDoc.save();

    res.status(200).json({
      message: "Content removed from saved list.",
      savedItems: userDoc.savedForLater
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Check if content is saved
app.get("/api/save-for-later/check/:contentId/:contentType", verifyToken, async (req, res) => {
  try {
    const { contentId, contentType } = req.params;

    const userDoc = await User.findById(req.userId);

    if (!userDoc) {
      return res.status(400).json({ message: "User not found." });
    }

    const isSaved = userDoc.savedForLater.some(
      item => item.contentId === contentId && item.contentType === contentType
    );

    res.status(200).json({ isSaved });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  connectToDB();
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Server accessible at http://localhost:${PORT}`);
  console.log(`Server accessible on network at http://[YOUR_IP]:${PORT}`);
});
