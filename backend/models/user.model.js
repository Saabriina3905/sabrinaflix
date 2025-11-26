import mongoose from "mongoose";

const userSchema = mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  subscriptionStatus: { 
    type: String, 
    enum: ['trial', 'active', 'expired', 'none'],
    default: 'none'
  },
  trialStartDate: { type: Date, default: null },
  subscriptionEndDate: { type: Date, default: null },
  ratings: [{
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ['movie', 'tv'], required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  savedForLater: [{
    contentId: { type: String, required: true },
    contentType: { type: String, enum: ['movie', 'tv'], required: true },
    title: { type: String, required: true },
    posterPath: { type: String },
    backdropPath: { type: String },
    overview: { type: String },
    savedAt: { type: Date, default: Date.now }
  }]
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
