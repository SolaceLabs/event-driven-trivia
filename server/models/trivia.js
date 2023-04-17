const mongoose = require('mongoose');

const { Schema } = mongoose;
const chatSchema = new Schema({
  name: String, message: String, emoji: Boolean, timestamp: Date
});
const playerSchema = new Schema({
  names: [String], connected: [String], current: Number, high: Number, timestamp: Date
});

const winnerSchema = new Schema({
  nickName: String, name: String, email: String, answered: Boolean, answer: String, correct: Boolean, timing: Number, score: Number, rank: Number
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
    owner: { type: 'ObjectId', ref: 'User' },
    shared: { type: Boolean, default: false },
    deleted: { type: Boolean, default: false },
    hash: { type: String },
    adminHash: { type: String },
    collect_winners: { type: Boolean, required: false },
    no_of_winners: { type: Number, default: 0 },
    winners: [winnerSchema],
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
