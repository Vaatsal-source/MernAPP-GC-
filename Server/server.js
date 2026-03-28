import dotenv from 'dotenv';
import express from 'express';
import jwt from 'jsonwebtoken';
import auth from './auth.js';
import mongoose from 'mongoose';
import cors from 'cors';
import Rating from './Rating.js'; 
import Comment from './Comment.js';
import User from './User.js';
import path from 'path';

if (process.env.NODE_ENV !== 'production') {
  dotenv.config();
}

const JWT_SECRET = process.env.JWT_SEC;
const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.resolve();

mongoose.connect(process.env.MONGODB_URI);
const envResult = dotenv.config();

app.get('/api/ratings/:gameId', async (req, res) => {
  try {
    const ratings = await Rating.find({ gameId: req.params.gameId });
    const total = ratings.length;
    const avg = total > 0 ? (ratings.reduce((a, b) => a + b.rating, 0) / total).toFixed(1) : 0;
    res.json({ avg, total });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/ratings', auth, async (req, res) => {
  try {
    const newRating = new Rating({ ...req.body, userId: req.user.id });
    await newRating.save();
    res.status(201).json(newRating);
  } catch (err) { 
    if (err.code === 11000) return res.status(400).json({ error: "Already rated" });
    res.status(500).json({ error: err.message }); 
  }
});


app.get('/api/comments/:gameId', async (req, res) => {
  try {
    const comments = await Comment.find({ gameId: req.params.gameId }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) { res.status(500).json({ error: err.message }); }
});


app.post('/api/comments', auth, async (req, res) => {
  const { id, text, gameId, userName, userPhoto } = req.body;
  try {
    if (id) {
      
      const comment = await Comment.findById(id);
      if (!comment) return res.status(404).json({ error: "Not found" });
      if (comment.userId !== req.user.id) return res.status(401).json({ error: "Unauthorized" });
      
      const updated = await Comment.findByIdAndUpdate(id, { text, editedAt: Date.now() }, { new: true });
      return res.json(updated);
    }
    
    const newComment = new Comment({ gameId, text, userName, userPhoto, userId: req.user.id });
    await newComment.save();
    res.status(201).json(newComment);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ msg: "Comment not found" });
    if (comment.userId !== req.user.id) return res.status(401).json({ msg: "Not authorized" });

    await Comment.findByIdAndDelete(req.params.id);
    res.json({ msg: "Comment removed" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


app.post('https://mernapp-gc-6.onrender.com/api/auth/google-login', async (req, res) => {
  const { googleId, email, displayName, photoURL } = req.body;
  try {
    let user = await User.findOne({ googleId });
    if (!user) {
      user = new User({ googleId, email, displayName, photoURL });
      await user.save();
    }
    const data = { user: { id: user.id } };
    const authToken = jwt.sign(data, JWT_SECRET);
    res.json({ success: true, authToken, user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.use(express.static(path.join(__dirname, '../dist')));
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log("Server running on port 5000"));
