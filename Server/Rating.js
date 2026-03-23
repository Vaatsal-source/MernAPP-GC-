import mongoose from 'mongoose';

const RatingSchema = new mongoose.Schema({
  gameId: { type: String, required: true },
  userId: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  createdAt: { type: Date, default: Date.now }
});


RatingSchema.index({ gameId: 1, userId: 1 }, { unique: true });
export default mongoose.model('Rating', RatingSchema);