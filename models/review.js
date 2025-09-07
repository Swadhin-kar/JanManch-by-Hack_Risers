const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    review_option: { type: String, required: true, enum: ['support', 'neutral', 'oppose'] },
    reason: { type: String, required: true },
    impact: { type: String, required: false },
    suggestion: { type: String, required: false },
    createdAt: { type: Date, default: Date.now },
    lawId: { type: Schema.Types.ObjectId, ref: 'Law', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'Listing', required: true }
});

const Review = mongoose.model("Review", reviewSchema);
module.exports = Review;