import mongoose from 'mongoose';

const CommentSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  userId: { type: String, required: true },
  userName: String,
  userPhoto: String,
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  editedAt: Date
});

export default mongoose.model('Comment', CommentSchema);