const mongoose = require('mongoose');

const { Schema } = mongoose;
const chatSchema = new Schema({
  name: String, message: String, emoji: Boolean, timestamp: Date
});
const playerSchema = new Schema({
  names: [String], connected: [String], current: Number, high: Number, timestamp: Date
});

const TriviaSchema = new Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    audience: { type: String, required: true },
    category: { type: String, required: true },
    questions: [{ type: 'ObjectId', ref: 'Question' }],
    no_of_questions: { type: Number, required: true },
    time_limit: { type: Number, required: true },
    scheduled: { type: Boolean, required: false },
    start_at: { type: Date, required: false },
    close_at: { type: Date, required: false },
    mode: { type: String, default: 'RANDOM', required: false },
    players: { type: playerSchema },
    chat: [chatSchema],
    status: { type: String, required: true }, // NEW, READY, SCHEDULED, EXPIRED, COMPLETED, ABORTED
    hash: { type: String },
    adminHash: { type: String }
  }, {
    virtuals: {
      id: {
        get() {
          return this._id.toString();
        }
      }
    }
  }, {
    timestamps: true,
    autoIndex: true
  }
);

TriviaSchema.index({
  name: 1, category: 1, status: 1, audience: 1
});
TriviaSchema.set('toObject', { virtuals: true });
TriviaSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Trivia', TriviaSchema);
